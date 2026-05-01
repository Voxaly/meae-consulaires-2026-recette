/** @this {Election} */
function Election(description, name, groupParameters, questions, uuid) {
	this.description = description;
	this.name = name;
	this.groupParameters = groupParameters;
	this.uuid = uuid;
	// list of Question
	this.questions = [];

	for (var i=0; i<questions.length; i++) {
		var question = questions[i];
		this.questions.push(new Question(question.text, question));
	}

	this.toJSON = function() {
		return {
			description: this.description,
			name: this.name,
			uuid: this.uuid
		};
	}
}
