
//---------------------- abstract GroupCyclic --------------------------------------------------
/** @this {GroupCyclic} */
function GroupCyclic(neutral, params) {
	// P is the modulo of the group
	this.modulo = new BigInteger(params.p, 36);
	// Q is the number of elements in the group (order)
	this.order = new BigInteger(params.q, 36);
	// one is the neutral element
	this.neutral = this.newElement(this.buildValueFromObject(neutral, true), 'ONE');
	// G is the generator. G.exponentiate(n) will generate the nth element of the group
	this.generator = this.newElement(this.buildValueFromObject(params.g, true), 'G');
	this.generatorInverse = this.generator.invert(true);
	this.generatorInverse.name = '1/G';

	// convenience aliases
	this.Q = this.order;
	this.P = this.modulo;
	this.G = this.generator;
	this.invG = this.generatorInverse;
	this.one = this.neutral;
}

GroupCyclic.prototype.toString = function() {
	return "[group neutral: " + this.neutral.toString() + "]";
};
GroupCyclic.prototype.buildJSONelement = function(value) {
	return value.toJSON();
};

// deserialize a "value" from an input (typically JSON). Nocheck is necessary to avoid calling isMember on G and one during setup
GroupCyclic.prototype.buildValueFromObject = function(serialized, nocheck) {
	throw new Error("Called buildValueFromObject on an abstract group");
};
// checks is an element is a member of that group
GroupCyclic.prototype.isMember = function(value) {
	// check Lagrange theorem
	if (this.composeSelfN(value, this.order).compareTo(this.neutral._value) != 0)
		return false;
	return true;
};
GroupCyclic.prototype.compare = function(valueA, valueB) {
	throw new Error("Called areEquals on an abstract group");
};
GroupCyclic.prototype.areEquals = function(valueA, valueB) {
	return this.compare(valueA, valueB) == 0;
};
// returns the result of composition of A with B
GroupCyclic.prototype.compose = function(valueA, valueB) {
	throw new Error("Called compose on an abstract group");
};
// returns the result of composition of A with the invert of B (aka. divide)
GroupCyclic.prototype.composeInvert = function(valueA, valueB) {
	return this.compose(valueA, this.invert(valueB));
};

// returns the result of composition of A with itself, N times
GroupCyclic.prototype.composeSelfN = function(valueA, times) {
	// naive implementation, should hopefully be replaced with optimized one
	if (times == 0)
		return this.neutral;
	var acc = valueA;
	for (var i=1; i<times; i++)
		acc = this.compose(acc, valueA);
	return acc;
};
GroupCyclic.prototype.newElement = function(value, name) {
	return new GroupElement(this, value, name);
};

GroupCyclic.prototype.invert = function(value) {
	throw new Error("Called invert on an abstract group");
};

GroupCyclic.prototype.isLongOperation = function(operation, value) {
	return false;
};

//---------------------- GroupElement --------------------------------------------------
/** @this {GroupElement} */
function GroupElement(group, value, name, operation, op1, op2) {
	if (!group.constructor == GroupCyclic)
		throw new Error("Group element must be supplied with a valid group");

	// build a resolved Operand
	Operand.call(this, value, operation, op1, op2);

	this._group = group;
	this.name = name || null;
}
extend(Operand, GroupElement);

// set new value
GroupElement.prototype.set = function(value) {
	if (!this._group.isMember(value)) 
		throw new Error("Attempt to set a group element with a invalid value !");
	this._value = value;
	return this;
};
GroupElement.prototype.toJSON = function() {
	if (this._value !== undefined)
		return this._group.buildJSONelement(this._value);
	else
		return "<unresolved operand>";
};

GroupElement.prototype.isNeutral = function() {
	return this._group.compare(this._value, this._group.neutral) == 0;
};

GroupElement.prototype.getGroup = function() {
	return this._group;
};

GroupElement.prototype.compareTo = function(element) {
	if (element.getGroup() != this._group)
		throw new Error("Attempt to compare elements from different groups !");
	return this._group.compare(this._value, element.value());
};

GroupElement.prototype.equals = function(element) {
	if (element.getGroup() != this._group)
		throw new Error("Attempt to compare elements from different groups !");
	return this._group.areEquals(this._value, element.value())
};

// checks that this element actually belongs to the group
GroupElement.prototype.check = function() {
	return this._group.isMember(this._value);
};

GroupElement.prototype.toString = function(nosymbolic, immediate) {
	if (this.chooseDelay(immediate)) {
		// tracer.log("Delaying GroupElement/toString");
		return new OperandString(null, GroupElement.prototype.toString, this, nosymbolic);
	} else {
		this.stats.toString += 1;
		// tracer.log("Processing immediate GroupElement/toString");
		return new OperandString((!nosymbolic && this.name) || this._value.toString());
	}
};

GroupElement.prototype.compose = function(element, immediate) {
	// groups must be the same
	if (element.getGroup() != this._group)
		throw new Error("Attempt to do group compose between elements of different groups !");
	// if (!this.check())
	// 	throw new Error("Attempt to do group compose on an invalid group member !");
	// if (!element.check())
	// 	throw new Error("Attempt to do group compose with an invalid group member !");

	// quick response: compose with neutral does nothing
	if (element === this._group.neutral)
		return this;

	if (this.chooseDelay(immediate, element)) {
		// tracer.log("Delaying GroupElement/compose");
		return new GroupElement(this._group, null, null, GroupElement.prototype.compose, this, element);
	} else {
		this.stats.compose += 1;
		// tracer.log("Processing immediate GroupElement/compose: " + this.toString(false, true) + " and " + element.toString(false, true));
		return this._group.newElement(this._group.compose(this._value, element.value()));
	}
};

GroupElement.prototype.composeInvert = function(element, immediate) {
	// groups must be the same
	if (element.getGroup() != this._group)
		throw new Error("Attempt to do group compose between elements of different groups !");
	// if (!this.check())
	// 	throw new Error("Attempt to do group compose on an invalid group member !");
	// if (!element.check())
	// 	throw new Error("Attempt to do group compose with an invalid group member !");

	// quick response: composeInvert with neutral does nothing
	if (element === this._group.neutral)
		return this;

	if (this.chooseDelay(immediate, element)) {
		// tracer.log("Delaying GroupElement/composeInvert");
		return new GroupElement(this._group, null, null, GroupElement.prototype.composeInvert, this, element);
	} else {
		this.stats.composeInvert += 1;
		// tracer.log("Processing immediate GroupElement/composeInvert: " + this.toString(false, true) + " and " + element.toString(false, true));
		return this._group.newElement(this._group.composeInvert(this._value, element.value()));
	}
};

// exp is a OperandBignum or a BigInteger (that we'll wrap)
GroupElement.prototype.composeSelfN = function(exp, immediate) {
	if (exp.constructor === BigInteger)
		exp = new OperandBignum(exp);
	// groups must be the same
	// if (!this.check())
	// 	throw new Error("Attempt to do group composeSelfN on an invalid group member !");

	// quick response for exp=0, as it is not supported by at least a BigInteger lib.
	if (exp.value().compareTo(BigInteger.ZERO) == 0)
		return this._group.neutral;
	if (exp.value().compareTo(BigInteger.ONE) == 0)
		return this;

	if (this.chooseDelay(immediate, exp)) {
		// tracer.log("Delaying GroupElement/composeSelfN");
		return new GroupElement(this._group, null, null, GroupElement.prototype.composeSelfN, this, exp);
	} else {
		this.stats.composeSelfN += 1;
		// tracer.log("Processing immediate GroupElement/composeSelfN: " + this.toString(false, true) + " and " + exp.value().toString());
		return this._group.newElement(this._group.composeSelfN(this._value, exp.value()));
	}
};
GroupElement.prototype.invert = function(immediate) {
	// if (!this.check())
	// 	throw new Error("Attempt to do group invert on an invalid group member !");

	if (this.chooseDelay(immediate)) {
		// tracer.log("Delaying GroupElement/invert");
		return new GroupElement(this._group, null, null, GroupElement.prototype.invert, this);
	} else {
		this.stats.invert += 1;
		// tracer.log("Processing immediate GroupElement/invert: " + this.toString(false, true));
		return this._group.newElement(this._group.invert(this._value));
	}
};

GroupElement.prototype.isLongOperation = function(operation) {
	return this._group.isLongOperation(operation, this._value);
};

// operation aliases for multiply notation
GroupElement.prototype.multiply = GroupElement.prototype.compose;
GroupElement.prototype.divide = GroupElement.prototype.composeInvert;
GroupElement.prototype.exponentiate = GroupElement.prototype.composeSelfN;

GroupElement.prototype.clearStats = function() {
	GroupElement.prototype.stats = {
		compose: 0,
		composeSelfN: 0,
		composeInvert: 0,
		invert: 0,
		toString: 0,
		toJSON: function() {
			return {
				"compose": this.compose,
				"composeSelfN": this.composeSelfN,
				"composeInvert": this.composeInvert,
				"invert": this.invert,
				"toString": this.toString
			};
		}
	};
};
GroupElement.prototype.clearStats();
