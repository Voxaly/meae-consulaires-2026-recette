
function Hproof(Q, prefix, zkp, elements, commitments) {

	// building the proof string one step at a time
	var proofStr = new OperandString(prefix + '|' + zkp + '|');
	for (var i=0; i<elements.length; i++) {
		proofStr = proofStr.concat(elements[i].toString(true));
		if (i !== elements.length-1)
			proofStr = proofStr.concat(',');
	}
	proofStr = proofStr.concat('|');
	for (var i=0; i<commitments.length; i++) {
		proofStr = proofStr.concat(commitments[i].A.toString(true));
		proofStr = proofStr.concat(',');
		proofStr = proofStr.concat(commitments[i].B.toString(true));
		if (i !== commitments.length-1)
			proofStr = proofStr.concat(',');
	}
	var hashbe = proofStr.sha256();
	return hashbe.mod(Q);

	// tracer.log('prefix: ' + prefix);
	// tracer.log('elements: ' + JSON.stringify(elements));
	// tracer.log('commitments: ' + JSON.stringify(commitments));
	// var proofStr = prefix + '|' + zkp;
	// proofStr += '|' + elements.map(function(ge) { return ge.toString(true); }).join(',');
	// proofStr += '|' + commitments.map(function(c) { return c.A.toString(true) + ',' + c.B.toString(true); }).join(',');
	// tracer.log("proofStr: " + proofStr);

	// var hash = SHA.create("SHA-256", "TEXT", "HEX").hash(proofStr);
	// var hashbe = new BigInteger(hash, 16);
	// return hashbe.mod(Q);
}

function makeProofsPossiblyBlankProof(groupParameters, zkp, min, max, c0, cS) {
	// zkp: groupMember
	// min/max: int
	// ms: int
	// c0/cs: cipherText
	var Q = groupParameters.Q;
	var G = groupParameters.G;
	var Y = groupParameters.Y;

	// all group members
	var P = [G, Y, c0.alpha, c0.beta, cS.alpha, cS.beta];

	var overallProofs = new Array(max - min + 2); // elements: Proof
	var blankProofs;

	if (c0.choice == 0) {
		// c0.choice = 0 -> NOT BLANK

		// 1. pick random challenge(pisgma) and response(pisigma) in Zq
		var challenge1 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_challenge1');
		var response1 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_response1');
		// 2. compute Asigma = g^response(pisigma) x alphasigma^challenge(pisigma) and Bsigma = y^response(pisigma) ×
		// betasigma^challenge(pisigma)
		var commitment1 = {
			A: G.exponentiate(response1).multiply(cS.alpha.exponentiate(challenge1)),
			B: Y.exponentiate(response1).multiply(cS.beta.exponentiate(challenge1))
		};
		// 3. pick a random w1 in Zq
		var w1 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_w1');
		// 4. compute A0 = g^w1 and B0 = y^w1
		var commitment0 = {
			A: G.exponentiate(w1),
			B: Y.exponentiate(w1)
		};
		// 5. compute challenge(pi0) = Hbproof0(S, P,A0,B0,Asigma,Bsigma) − challenge(pisigma) mod q
		var h = Hproof(Q, 'bproof0', zkp, P, [commitment0, commitment1]);
		var challenge0 = h.subtract(challenge1).mod(Q);
		// 6. compute response(pi0) = w1 − c0.random × challenge(pi0) mod q
		var response0 = w1.subtract(c0.random.multiply(challenge0)).mod(Q);

		blankProofs = [new Proof(challenge0, response0), new Proof(challenge1, response1)];

		if(cS.choice < min || cS.choice > max)
			throw new Error("Bad number of set choices");

		var commitments = new Array(max - min + 2); // elements: hash with A & B

		// 1. pick random challenge(pi0) and response(pi0) in Zq
		challenge0 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_challenge0');
		response0 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_response0');

		// 2. compute A0 = g^response(pi0) × alpha^challenge(pi0) and B0 = y^response(pi0) × (beta0/g)^challenge(pi0)
		commitments[0] = {
			A: G.exponentiate(response0).multiply(c0.alpha.exponentiate(challenge0)),
			B: Y.exponentiate(response0).multiply(c0.beta.divide(G).exponentiate(challenge0))
		};
		var total_challenges = challenge0;
		overallProofs[0] = new Proof(challenge0, response0);

		// 3. for j > 0 and j != i:
		for (var i=1; i < max-min+2; i++) {
			// tracer.log("otherproofs for i=" + i);
			if (i != cS.choice-min+1) {
				// (a) create pij with a random challenge and a random response in Zq
				var challenge = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_challenge_' + i);
				var response = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_response_' + i);
				var nbeta = cS.beta.divide(G.exponentiate(new BigInteger('' + (min+i-1))));
				overallProofs[i] = new Proof(challenge, response);
				// (b) compute Aj = g^response × alphasigma^challenge and Bj = y^response × (betasigma/g^Mj)challenge
				commitments[i] = {
					A: G.exponentiate(response).multiply(cS.alpha.exponentiate(challenge)),
					B: Y.exponentiate(response).multiply(nbeta.exponentiate(challenge))
				};
				total_challenges = total_challenges.add(challenge);
			}
		}

		// 4. pick a random w2 € Zq
		var w2 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_w2');
		// 5. compute Ai = g^w2 and Bi = y^w2
		commitments[cS.choice - min + 1] = {
			A: G.exponentiate(w2),
			B: Y.exponentiate(w2)
		};
		// 6. compute challenge(pii) = Hbproof1(S, P,A0,B0, . . . ,Ak,Bk) − SIGMA(j!=i) challenge(pij) mod q
		h = Hproof(Q, 'bproof1', zkp, P, commitments);
		var challenge = h.subtract(total_challenges).mod(Q);
		// 7. compute response(pii) = w2 − rsigma × challenge(pii) mod q
		var response = w2.subtract(cS.random.multiply(challenge)).mod(Q);
		overallProofs[cS.choice-min+1] = new Proof(challenge, response);
	} else {
		// c0.choice = 1 ->  BLANK

		// proof of c0.choice = 0 \/ cS.choice = 0 (second is true)
		if (cS.choice != 0)
			throw new Error("cS.choice > 0 on a blank vote ?");

		// The proof blank_proof of the whole statement is the couple of proofs (pi0, pisigma) built as in section
		// 4.9.1, but exchanging
		// subscripts 0 and SIGMA everywhere except in the call to Hbproof0.
		var challenge0 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_challenge0');
		var response0 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_response0');
		var commitment0 = {
			A: G.exponentiate(response0).multiply(c0.alpha.exponentiate(challenge0)),
			B: Y.exponentiate(response0).multiply(c0.beta.exponentiate(challenge0))
		};
		var w1 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_w1');
		var commitment1 = {
			A: G.exponentiate(w1),
			B: Y.exponentiate(w1)
		};
		var h = Hproof(Q, 'bproof0', zkp, P, [commitment0, commitment1]);
		var challenge1 = h.subtract(challenge0).mod(Q);
		var response1 = w1.subtract(cS.random.multiply(challenge1)).mod(Q);
		blankProofs = [new Proof(challenge0, response0), new Proof(challenge1, response1)];

		var commitments = new Array(max - min + 2); // elements: hash with A & B

		// * proof of c0.choice = 1 \/ min <= cS.choice <= max (first is true) *
		var total_challenges = new OperandBignum(BigInteger.ZERO);
		// 1. for j > 0:
		for (var i=1; i < max-min+2; i++) {
			// tracer.log("otherproofs for i=" + i);
			// (a) create pij with a random challenge and a random response in Zq
			var challenge = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_challenge');
			var response = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_response');
			// (b) compute Aj = g^response × alphasigma^challenge and Bj = y^response × (betasigma/g^Mj )^challenge
			var nbeta = cS.beta.divide(G.exponentiate(new BigInteger('' + (min+i-1))));
			overallProofs[i] = new Proof(challenge, response);
			commitments[i] = {
				A: G.exponentiate(response).multiply(cS.alpha.exponentiate(challenge)),
				B: Y.exponentiate(response).multiply(nbeta.exponentiate(challenge))
			};
			total_challenges = total_challenges.add(challenge);
		}

		// 2. pick a random w2 € Zq
		var w2 = new OperandBignum(randomizeUtils.randomize(Q), 'oproof_rand_w2');
		// 3. compute A0 = g^w2 and B0 = y^w2
		commitments[0] = {
			A: G.exponentiate(w2),
			B: Y.exponentiate(w2)
		};
		// 4. compute challenge(pi0) = Hbproof1(S, P,A0,B0, . . . ,Ak,Bk) − SIGMA(j>0) challenge(pij) mod q
		h = Hproof(Q, 'bproof1', zkp, P, commitments);
		var challenge = h.subtract(total_challenges).mod(Q);
		// 5. compute response(pi0) = w2 − c0.random × challenge(pi0) mod q
		var response = w2.subtract(c0.random.multiply(challenge)).mod(Q);
		overallProofs[0] = new Proof(challenge, response);
	}
	return {
		"blankProofs": blankProofs,
		"overallProofs": overallProofs
	};
}

function generateOtherProofs(group, question, zkp, ciphered) {
	var nbChoices = ciphered.length;
	var min = question.minSelection;
	var max = question.maxSelection;
	// computing blank proof
	// les preuves ne sont pas calculés de la même façon si blanc autorisé ou pas.
	if (question.blankAllowed) {
		tracer.log("otherproofs with BLANK");
		// first bit is for the blank, skip it
		var ctSumc = ciphered.slice(1).reduce(function(t, u) { return t.multiply(u); });
		var sum1 = ctSumc.choice + ciphered[0].choice;
		if (sum1.choice < min || sum1.choice > max)
			throw new Error("Bad number of set choices (min:" + min + ", max:" + max + ", got:" + sum1.choice + ")");

		// we should probably check the min < iSumm < max
		return makeProofsPossiblyBlankProof(group, zkp, min, max, ciphered[0], ctSumc);

	} else {
		// blank not allowed
		tracer.log("otherproofs no BLANK");

		// proof is about the sums of choices belongs to the min/max range
		// build a fake ciphertext that is the "sum" of all the others
		var ctSumc = ciphered.reduce(function(t, u) { return t.multiply(u); });
		if (ctSumc.choice < min || ctSumc.choice > max)
			throw new Error("Bad number of set choices (min:" + min + ", max:" + max + ", got:" + ctSumc.choice + ")");

		var individualProofGenerator = new IndividualProofGenerator(group.Q, group.G, group.Y, min, max, zkp);
		individualProofGenerator.compute(ctSumc);

		return {
			"blankProofs": [],
			"overallProofs": ctSumc.proof
		};
	}
}
