/** @this {Ballot} */
function Ballot(election, tokenId) {
	this.election = election;
	var token = tokenId;
	var zkp = this.election.uuid + token;
	this.finished = false;
	var progressTotal = 0;		// total number of exponentiations that we'll do
	var progressStart = null;	// how many exps we did before the votes are submitted
	this.stats = {
		tasksTotal: 0,
		taskSkipped: 0,
		resolve: 0,
		toJSON: function() {
			return {
				"tasksTotal": this.tasksTotal,
				"taskSkipped": this.taskSkipped,
				"resolve": this.resolve
			};
		}
	};
	// force clean global (!) stats
	OperandBignum.prototype.clearStats();
	OperandString.prototype.clearStats();
	GroupElement.prototype.clearStats();

	var self = this;

	if (navigator)
		tracer.log("UserAgent: " + navigator.userAgent);
	if (window) {
		tracer.log("window.crypto: " + (window.crypto !== undefined));
		tracer.log("window.msCrypto: " + (window.msCrypto !== undefined));
	}

	//--------------------------- tasks management ---------------------------

	var tasks = [];
	this.listTasks = function() {
		return tasks.map(function(t){ return t.title; });
	};
	function addTask(title, funcname, args, first) {
		self.stats.tasksTotal += 1;
		if (first)
			tasks.unshift({title: title, func: funcname, args: args});
		else
			tasks.push({title: title, func: funcname, args: args});
	}
	function addResolve(name, operand) {
		if (!operand.isResolved())
			addTask(name, self.resolveOperand, [operand], true);
	}

	this.processTask = function() {
		if(tasks.length == 0) {
			// nothing to do, schedule another try in half a second
			setTimeout(function() { self.processTask(); }, 500);
			return;
		}

		var task = tasks.shift();

		// tracer.log("running task: " + task.title);
		// var start = new Date().getTime();
		task.func.apply(this, task.args);
		// var end = new Date().getTime();
		// tracer.log("spent " + (end - start) + "ms");

		// schedule next task processing for soon
		setTimeout(function() { self.processTask(); }, 10);
	};

	//--------------------------- tasks functions ---------------------------

	this.computeBit = function(question, value, num) {
		// if the vote is started, we know the votes so don't compute extraneous bits
		if (question.choicesNbOne) {
			var needed = value == 0 ? question.answersNb - question.choicesNbOne : question.choicesNbOne;
			// tracer.log("value: " + value + ", needed: " + needed + ", num: " + num);
			if (num+1 > needed) {
				this.stats.taskSkipped += 1;
				tracer.log("We already have enough " + value + "s (needed: " + needed + "), skipping " + (num+1) + "th");
				progressTotal -= (2 + 6);
				return;
			}
		}
		var params = this.election.groupParameters;
		var r = new OperandBignum(randomizeUtils.randomize(params.Q));
		var ct = elGamalCipherSingle(params.G, params.Y, value, r);
		question.poolsCiphered[value].push(ct);

		// resolve the new ct
		addTask("Resolve ElGamal beta v=" + value + ", n=" + num, this.resolveOperand, [ct.beta], true);
		addTask("Resolve ElGamal alpha v=" + value + ", n=" + num, this.resolveOperand, [ct.alpha], true);

		this.individualProofGenerator.compute(ct);

		// resolve the proofs challenge/response
		addResolve("Resolve iproof 1 response, v=" + value + ", n=" + num, ct.proof[1].response);
		addResolve("Resolve iproof 1 challenge, v=" + value + ", n=" + num, ct.proof[1].challenge);
		addResolve("Resolve iproof 0 response, v=" + value + ", n=" + num, ct.proof[0].response);
		addResolve("Resolve iproof 0 challenge, v=" + value + ", n=" + num, ct.proof[0].challenge);
	};

	this.fillAnswers = function(question) {
		// tracer.log("Picking " + (question.answersNb - question.choicesNbOne) + "x0s and " + question.choicesNbOne + "x1s from pools");

		tracer.timeEnd("compute bits");

		// pick pre-computed ciphered from the pools into a simple list of the cipherTexts, to be used for otherProof.
		for (var i=0; i<question.answersNb; i++)
			question.ciphered.push(question.poolsCiphered[question.choices[i]].pop());

		// build the view that will be actually sent
		question.answer.choices = question.ciphered.map(function(ct) {
			return {
				"cipherText": { "alpha": ct.alpha, "beta": ct.beta },
				"individualProofs": ct.proof
			};
		})
		// tracer.log("Discarding " + question.poolsCiphered[0].length + "x0s and " + question.poolsCiphered[1].length + "x1s");
		question.poolsCiphered = [];
	};

	this.generateOtherProof = function(question) {
		tracer.time("otherproof");
		question.answer.othersProofs = generateOtherProofs(this.election.groupParameters, question, zkp, question.ciphered);
		// empty the list, won't be used again
		question.ciphered = null;

		var ovs = question.answer.othersProofs["overallProofs"];
		for (var i=ovs.length-1; i>=0; i--) {
			addResolve("Resolve oproof overall " + i + " response", ovs[i].response);
			addResolve("Resolve oproof overall " + i + " challenge", ovs[i].challenge);
		}
		var bps = question.answer.othersProofs["blankProofs"];
		if (bps.length > 0) {
			addResolve("Resolve oproof blank 1 response", bps[1].response);
			addResolve("Resolve oproof blank 1 challenge", bps[1].challenge);
			addResolve("Resolve oproof blank 0 response",  bps[0].response);
			addResolve("Resolve oproof blank 0 challenge", bps[0].challenge);
		}
	};

	this.finish = function(question) {
		tracer.timeEnd("otherproof");
		this.finished = true;
	};

	// resolve an operand, a few operations at a time. Push itself first in the queue until it has finished.
	this.resolveOperand = function(operand) {
		this.stats.resolve += 1;

		// first run, build the ordered list of operations to run
		if (!operand.resolutionQueue)
			operand.buildResolutionQueue();

		if (operand.resolutionQueue.length === 0)
			return;

		// we run operations until the next one is a long one (exponentiate)
		var maxOp = 5;
		var nbOp = 0;
		var breakAfter = false;
		do {
			var op = operand.resolutionQueue.shift();
			// tracer.log("Running " + op._operation);
			// also break after long operations
			breakAfter = op.isLong();
			op.resolve();
			nbOp++;
		} while (operand.resolutionQueue.length > 0 && !operand.resolutionQueue[0].isLong() && !breakAfter && nbOp < maxOp);
		// tracer.log("Ran " + nbOp + " operations on this task");

		if (operand.resolutionQueue.length > 0)
			addTask("Resolve... (" + operand.resolutionQueue.length + " operations pending)", this.resolveOperand, [operand], true);
	};

	//--------------------------- tasks scheduling ---------------------------

	var questionsNb = election.questions.length;
	var params = election.groupParameters;
	this.individualProofGenerator = new IndividualProofGenerator(params.Q, params.G, params.Y, 0, 1, zkp);

	tracer.time("compute bits");

	// enqueue tasks to precompute ciphered and proofs
	for (var i=0; i<questionsNb; i++) {
		var question = election.questions[i];

		// we will have between "nb-max" and "nb-min" zeroes
		// first enqueue all the mandatory bits (total-max 0, min 1)
		for (var j=0; j<question.answersNb - question.maxSelection; j++)
			addTask("Precompute mandatory bit 0 (q" + i + "/" + j + ") ElGamal", this.computeBit, [question, 0, j]);
		for (var j=0; j<question.minSelection; j++)
			addTask("Precompute mandatory bit 1 (q" + i + "/" + j + ") ElGamal", this.computeBit, [question, 1, j]);

		// then the max-min putative ones, alternated
		for (var j=0; j<question.minmaxdiff; j++) {
			var offset0 = question.answersNb - question.maxSelection + j;
			var offset1 = question.minSelection + j;
			addTask("Precompute optional bit 0 (q" + i + "/" + offset0 + ") ElGamal", this.computeBit, [question, 0, offset0]);
			addTask("Precompute optional bit 1 (q" + i + "/" + offset1 + ") ElGamal", this.computeBit, [question, 1, offset1]);
		}	

		// if blank is allowed and set, we will need 0s up to answersNb - 1
		if (question.blankAllowed)
			for (var j=question.answersNb - question.minSelection; j < question.answersNb - 1; j++)
				addTask("Precompute additional bit 0 (q" + i + "/" + j + ") ElGamal", this.computeBit, [question, 0, j]);
	}
	// Estimation of the total number of exponentiations that we'll need to do
	// - elgamal takes 2 (plus 1 trivial 0-1)
	// - iproof takes 6
	// - oproof takes 
	//   - blankAllowed == true  => 12 + (max-min)*5   (-1 if min=1 and choicesNbOne=1, but we don't know that in advance)
	//   - blankAllowed == false => 2 + (max-min)*4
	for (var i=0; i<questionsNb; i++) {
		var question = this.election.questions[i];
		progressTotal += (2 + 6) * (question.answersNb + question.minmaxdiff);

		if (question.blankAllowed)
			progressTotal += 12 + (question.minmaxdiff) * 5;
		else
			progressTotal += 2 + (question.minmaxdiff) * 4;
	}
	tracer.log("Total number of exponentiate to do: " + progressTotal);

	// start the task runner
	this.processTask();

	//--------------------------- methods for external use ---------------------------

	this.getProgress = function() {

		// The only timewise significant operations are the exponentiations
		// so the progress is an estimation of the remaining ones over the total

		// progressTotal is sometime "off by one" (if min=1 and nbChoice > min), so force 100% when finished to avoir stalling at ~98%
		if (progressStart === null)
			return 0;
		if (this.finished)
			return 1;

		// We can check on stats.operandGroup.composeSelfN how any we have done yet
		// 'vote' action sets the starting point of progress (this.startProgress)
		// Computations that we skip are added the number of spared exp to the counter

		var expDone = GroupElement.prototype.stats.composeSelfN;
		// tracer.log("exponentiate done: " + expDone);

		var percent = (expDone - progressStart) / (progressTotal - progressStart);
		// tracer.log("progress: " + percent + "%");
		return percent < 1 ? percent : 1;
	};

	this.fill = function(votes) {

		// check that we got the right number of choice bits
		if (votes.length != this.election.questions.length)
			throw new Error("Bad votes number, got " + votes.length + " while election had " + questionsNb + " questions");

		// tell each question the answer it got
		for (var i=0; i<questionsNb; i++) {
			var question = this.election.questions[i];
			question.choices = votes[i];
			question.choicesNbOne = votes[i].reduce(function(s, v) { return s+v; });

			// check that the submitted vote for this question has the right number of bits
			if (question.choices.length !== question.answersNb)
				throw new Error("Bad number of vote bits for question " + i + ", got " + question.choices.length + " while question had " + question.answersNb + " options");

			if (question.blankAllowed && question.choices[0] === 1) {
				// blank is allowed and the blank bit is set, check that no other one is
				if (question.choicesNbOne !== 1)
					throw new Error("Blank bit is exclusive");
			} else {
				// blank is not allowed or the blank bit is not set, check that the number of 1s is between bounds
				if (question.choicesNbOne < question.minSelection || question.choicesNbOne > question.maxSelection)
					throw new Error("Bad number of set choices (min:" + question.minSelection + ", max:" + question.maxSelection + ", got:" + question.choicesNbOne + ")");
			}

			// fill the 'answers' with pre-computed ciphered+proof for the choices
			addTask("Fill answers with pre-computed bits", this.fillAnswers, [question]);

			// compute other_proof
			addTask("Compute the overall proof", this.generateOtherProof, [question]);
		}
		addTask("Finish", this.finish, []);

		progressStart = GroupElement.prototype.stats.composeSelfN;
		// tracer.log("Progress will start at " + progressStart);
	};

	this.get = function() {
		var ret = {};

		ret["answers"] = [];
		for (var i=0; i<this.election.questions.length; i++)
			ret["answers"].push(this.election.questions[i].answer);

		// Hash is probably not used (yet?), there's no concensus on the representation of election. This is the only Base64 field.
		ret["electionHash"] = SHA.create("SHA-256", "TEXT", "B64").hash(JSON.stringify(this.election));
		ret["electionUUID"] = this.election.uuid;
		ret["tokenId"] = token;
		return ret;
	};
}
