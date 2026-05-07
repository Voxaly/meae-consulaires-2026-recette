/** @this {Question} */
function Question(text, parameters) {

	this.blankAllowed = parameters.isBlankAllowed;
	this.minSelection = parameters.minSelection;
	this.maxSelection = parameters.maxSelection;
	this.minmaxdiff = parameters.maxSelection - parameters.minSelection;
	this.text = text;

	this.poolsCiphered = [[], []];
	this.choices = null;
	this.choicesNbOne = null;

	this.answersNb = parameters.nbElements;
	this.ciphered = [];

	this.answer = {
		choices: null,
		othersProofs: null
		// toJSON: function() {
		// 	return {
		// 		"choices": this.choices,
		// 		"othersProofs": this.othersProofs
		// 	};
		// }
	};
}
