/** @this {IndividualProofGenerator} */
function IndividualProofGenerator(Q, G, Y, min, max, zkp) {

	// precompute 1/g^n (disjunctions)
	// init the first element with [min, 1/g^min]
	var invg = G.getGroup().invG;
	var disjuncts = {};
	disjuncts[min] = invg.exponentiate(new BigInteger('' + min));

	// add elements up to max, multiplying by 1/g each time
	for (var i = 1; i <= max-min; i++)
		disjuncts[min+i] = disjuncts[min+i-1].multiply(invg);

	this.iprove = function(alpha, beta, elements) {

		// building the proof string one step at a time
		var proofStr = new OperandString('prove|' + zkp + '|');
		proofStr = proofStr.concat(alpha.toString(true));
		proofStr = proofStr.concat(',');
		proofStr = proofStr.concat(beta.toString(true));
		proofStr = proofStr.concat('|');
		for (var i=0; i<elements.length; i++) {
			proofStr = proofStr.concat(elements[i].A.toString(true));
			proofStr = proofStr.concat(',');
			proofStr = proofStr.concat(elements[i].B.toString(true));
			if (i !== elements.length-1)
				proofStr = proofStr.concat(',');
		}
		var hashbe = proofStr.sha256();
		return hashbe.mod(Q);

		// var listABs = [];
		// for (var i=0; i<elements.length; i++)
		// 	listABs.push(elements[i].A.toString(true) + ',' + elements[i].B.toString(true));
		// var proofStr = 'prove|' + zkp + '|' + alpha.toString(true) + ',' + beta.toString(true) + '|' + listABs.join(',');
		// tracer.log("proofStr: " + proofStr);

		// var hash = SHA.create("SHA-256", "TEXT", "HEX").hash(proofStr);
		// var hashbe = new BigInteger(hash, 16);
		// return hashbe.mod(Q);
	};

	// this is used to identify the group of randoms (incremented each time we compute a proof)
	var randomGroupIndex = 0;

	this.compute = function(ct) {

		// we will have a Proof (=challenge/response pair) for each possible value
		var proof = new Array(max-min+1);

		// prepare commitments (2 * n * GroupElement)
		var commitments = new Array(max-min+1);

		// total_challenges
		var total_challenges = new OperandBignum(BigInteger.ZERO);

		randomGroupIndex++;

		// pour chaque disjunction ou plutot pour avoir un membre de l'intervalle en résumé, on calcul le 1. de la Proofs of interval membership à savoir:
		// 1. for j!=i
		// (a) create pij with a random challenge and a random response
		// (b) compute Aj = g^response / alpha^challenge and Bj = y^response / (beta/g^Mj)^challenge where g^Mj is a disjunction = 1/g^Mj
		// fill proof & commitment for i != choices[index]
		for(var i=min; i<=max; i++) {
			if (i != ct.choice) {
				var challenge = new OperandBignum(randomizeUtils.randomize(Q), 'iproof_rand_challenge_choice:' + randomGroupIndex + '_value:' + i);
				var response = new OperandBignum(randomizeUtils.randomize(Q), 'iproof_rand_response_choice:' + randomGroupIndex + '_value:' + i);
				proof[i-min] = new Proof(challenge, response);
				commitments[i-min] = {
					A: G.exponentiate(response).divide(ct.alpha.exponentiate(challenge)),
					B: Y.exponentiate(response).divide(ct.beta.multiply(disjuncts[i]).exponentiate(challenge))
				};
				total_challenges = total_challenges.add(challenge);
			}
		}

		// 2. pii is created as follows
		// compute proof for i = choices[index]

		// (a) pick a random w € Zq
		var w = new OperandBignum(randomizeUtils.randomize(Q), 'iproof_rand_w_choice:' + randomGroupIndex);
		// (b) compute Ai = g^w and Bi = y^w
		commitments[ct.choice-min] = {
			A: G.exponentiate(w),
			B: Y.exponentiate(w)
		};

		// (c) challenge(pii) = Hiprove(S,alpha,beta,A0,B0,...,Ak,Bk) - SIGMA(j!=i) challenge(pij) mod q
		var hiprove = this.iprove(ct.alpha, ct.beta, commitments);
		var challenge = hiprove.subtract(total_challenges).mod(Q);
		// (d) response(pii) = w + r x challenge(pii) mod q
		var response = w.add(ct.random.multiply(challenge)).mod(Q);

		proof[ct.choice-min] = new Proof(challenge, response);

		ct.proof = proof;
	}
}
