/** @this {CipherText} */
function CipherText(alpha, beta, choice, random) {
	// alpha & beta are GroupMembers
	this.alpha = alpha;
	this.beta = beta;
	// choice and random used to compute alpha/beta
	this.choice = choice;
	this.random = random;
	this.proof = null;

	// multiply this CipherText with another, outputs a new CipherText
	this.multiply = function(b) {
		return new CipherText(this.alpha.multiply(b.alpha), this.beta.multiply(b.beta), this.choice + b.choice, this.random.add(b.random));
	}
	this.copy = function() {
		return new CipherText(this.alpha, this.beta, this.choice, this.random);
	}
	this.equals = function(ct) {
		if (!ct)
			return false;
		if (this == ct)
			return true;
		if (this.alpha.equals(ct.alpha) && this.beta.equals(ct.beta))
			return true;
		return false;
	}
	this.toString = function() {
		return "CipherText [alpha=" + this.alpha + ", beta=" + this.beta + ", choice=" + this.choice + ", random=" + this.random.toString(36) + "]";
	}
	this.toJSON = function() {
		return {
			alpha: this.alpha,
			beta: this.beta,
			choice: this.choice,
			proof: this.proof
		};
	}
}
