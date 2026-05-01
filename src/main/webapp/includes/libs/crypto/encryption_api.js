// Store the function in a global property referenced by a string:
window['JsEncryptionEngine'] = JsEncryptionEngine;

/** @this {JsEncryptionEngine} */
function JsEncryptionEngine() {

	var self = this;

	self.ballot = null;

	this.init = function(parameters) {
		var groupParameters = new GroupParameters(parameters.groupParameters, parameters.electionPublicKey);
		randomizeUtils.setRandomPool(parameters.bigIntegerRndPool);

		// ciphering only requires the self.election's public key
		var election = new Election("Election's description", "Election's name", groupParameters, parameters.questions, parameters.uuidString);
		self.ballot = new Ballot(election, parameters.tokenId);
	};

	this.setVote = function(voteList) {
		self.ballot.fill(voteList);
	};

	this.startUserProgressBar = function() {
	};

	this.getUserProgression = function(real) {
		return self.ballot === null ? 0 : self.ballot.getProgress();
	};

	this.isFinished = function() {
		return self.ballot ? self.ballot.finished : false;
	};

	this.getRemainingTime = function() {
		return (self.ballot && self.ballot.finished) ? 0 : 10;
	};

	/**
	 * JSON ##SHA256(ballotJSON/64secretCode)
	 */
	// credentials is the SHA256(login + secretCode)
	this.getBallot = function(userSecretCode) {
		const ballotStr = JSON.stringify(self.ballot.get());
		const secret = SHA.create("SHA-256", "TEXT", "HEX").hash(ballotStr + userSecretCode);
		return {
			"ballot": ballotStr,
			"secret": '##' + secret
		};
	};

	// ----------- Dans un 2eme temps ------------
	this.ballotTypeSwitch = function() {
		// Should we switch to NH ? For now, we'll ignore the opportunity
	};

	this.getStatistics = function() {
		return {
			"operandBignum": OperandBignum.prototype.stats,
			"operandString": OperandString.prototype.stats,
			"operandGroup": GroupElement.prototype.stats,
			"ballot": self.ballot.stats
		};
	};
}
