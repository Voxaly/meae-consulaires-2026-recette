
// an Operand can be resolved (= numerical value is available) or not (operations still pending)

// Operand is abstract. child classes are:
//	- GroupElement
//		- invert / multiply / divide / exponentiate
//  - OperandBigNum
//		- add / subtract / multiply / mod
//	- OperandString
//		- concat (will add all supplied string at the end)
//		- SHA256

// Operand operations always return a new Operand.
//   they call chooseDelay to choose wether it will be a resolved one or not on the basis of
//		- if the operands passed are resolved or not
//		- if 'immediate' mode is forced (passed as an optional 'true' argument)

var OperandSerial = 1;
/** @this {Operand} */
function Operand(value, operation, op1, op2) {
	this.serial = OperandSerial++;

	// if the operation is resolved, 'operation' is undefined and the value is set
	this._operation = undefined;
	this._operand1 = undefined;
	this._operand2 = undefined;
	this._value = undefined;

	// sorted list of operations to run to resolve us
	this.resolutionQueue = null;

	if (value != null && value != undefined) {
		// Operand is already resolved
		this._value = value;
	} else {
		// op1 must be an Operand. op2 can be a raw value, it will be simply fed to the operation
		this._operation = operation;
		this._operand1 = op1;
		this._operand2 = op2 || undefined;
	}
}

Operand.prototype.delayed = true;

Operand.prototype.clearStats = function() {
	throw new Error("No stats at Operand root level");
}

Operand.prototype.isResolved = function() {
	return this._value !== undefined;
};

Operand.prototype.value = function() {
	if (this._value === undefined)
		throw new Error("this operation is not resolved yet");
	return this._value;
};
Operand.prototype.toJSON = function() {
	if (this._value === undefined)
		throw new Error("this operation is not resolved yet");
	return this._value.toJSON();
};

// try to run the operation, throws if operands are not resolved yet
Operand.prototype.resolve = function() {
	if (this.isResolved())
		throw new Error("this operation is already resolved");
	if (!this._operand1.isResolved())
		throw new Error("operand1 is not resolved yet");
	if (this._operand2 !== undefined && this._operand2.constructor === GroupElement && !this._operand2.isResolved())
		throw new Error("operand2 is not resolved yet");

	var val = undefined;
	var op1 = this._operand1;
	var op2 = this._operand2;

	// call the operation, forcing immediate resolution
	try {
		var args = op2 !== undefined ? [op2, true] : [true];
		val = this._operation.apply(op1, args).value();
	} catch(e) {
		throw new Error("error running " + this._operation.name + " operation available on operand " + op1.toString() + ": " + e);
	}

	this._value = val;
	// nil the operational arguments
	this._operation = this._operand1 = this._operand2 = undefined;
	return this;
};

// lists the resolutions that need to be done
Operand.prototype.buildResolutionQueue = function() {

	this.resolutionQueue = [];

	if (this.isResolved())
		return

	// !!! move to support list of operands ? the list is different for each operation (1 (invert, sha), 2 (add, ...), n (build string))

	// iteratively walk the whole tree, keep links to all unresolved nodes
	var stack = [this];
	var alreadyadded = {};

	// for each operand on the stack
	while (stack.length >0) {
		var op = stack.pop();

		// else add to resolve list
		this.resolutionQueue.push(op);

		function add(op) {
			if (op !== undefined && op.constructor === Operand && !op.isResolved() && !alreadyadded[op.serial]) {
				alreadyadded[op.serial] = 1;
				stack.push(op);
			}
		}

		// operands
		var oplist = [op._operand1, op._operand2];
		for (var i=0; i<oplist.length; i++)
			add(oplist[i]);
	}

	// sort them in ascending order of serial
	this.resolutionQueue.sort(function(a, b) { return a.serial - b.serial; });
	return this;
};

Operand.prototype.resolveFull = function() {
	this.buildResolutionQueue();

	this.resolutionQueue.forEach(function(op) {
		op.resolve();
	});
	return this;
};

Operand.prototype.isLong = function() {
	if (this.isResolved())
		throw new Error("this operation is already resolved");
	// "this" operand is of the result type, only _operand1 knows if the _operation will be long
	return this._operand1.isLongOperation ? this._operand1.isLongOperation(this._operation) : false;
};

Operand.prototype.chooseDelay = function(immediate, op) {

	// can we run it immediately ? no if some operand is not resolved yet
	var needDelay = !this.isResolved() || (op && !op.isResolved());
	if (needDelay && immediate)
		throw new Error("Attempt to run immediate operation with unresolved operands");

	// should we run it immediately ? yes if it is needed or explicitely required
	if (needDelay || (this.delayed && !immediate)) {
		return true;
	}
	return false;
};
