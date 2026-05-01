/** @this {Proof} */
function Proof(challenge, response) {
	this.challenge = challenge;
	this.response = response;

	this.toString = function() {
		return "Proof [challenge=" + challenge + ", response=" + response + "]";
	};
	this.copy = function() {
		return new Proof(this.challenge, this.response);
	};
	// this.toJSON = function() {
	// 	return {
	// 		"challenge": this.challenge,
	// 		"response": this.response
	// 	};
	// };
}
