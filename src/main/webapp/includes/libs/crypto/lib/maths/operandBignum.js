
/** @this {OperandBignum} */
function OperandBignum(value, name, operation, op1, op2) {
	// build a resolved Operand
	Operand.call(this, value, operation, op1, op2);
	this.name = name || null;
}
extend(Operand, OperandBignum);

// only implements the operations needed for proof challenge/response

// modulo is a OperandBignum too (it's always Q anyway)
OperandBignum.prototype.mod = function(modulo, immediate) {
	if (modulo.constructor === BigInteger)
		modulo = new OperandBignum(modulo);

	if (this.chooseDelay(immediate, modulo)) {
		// tracer.log("Delaying OperandBignum/mod");
		return new OperandBignum(null, null, OperandBignum.prototype.mod, this, modulo);
	} else {
		this.stats.mod += 1;
		// tracer.log("Processing immediate OperandBignum/mod: " + this._value.toString());
		return new OperandBignum(this._value.mod(modulo.value()));
	}
};
OperandBignum.prototype.add = function(op, immediate) {
	if (op.constructor === BigInteger)
		op = new OperandBignum(op);

	if (this.chooseDelay(immediate, op)) {
		// tracer.log("Delaying OperandBignum/add");
		return new OperandBignum(null, null, OperandBignum.prototype.add, this, op);
	} else {
		this.stats.add += 1;
		// tracer.log("Processing immediate OperandBignum/add: " + this._value.toString() + " and " + op._value.toString());
		return new OperandBignum(this._value.add(op.value()));
	}
};
OperandBignum.prototype.subtract = function(op, immediate) {
	if (op.constructor === BigInteger)
		op = new OperandBignum(op);

	if (this.chooseDelay(immediate, op)) {
		// tracer.log("Delaying OperandBignum/subtract");
		return new OperandBignum(null, null, OperandBignum.prototype.subtract, this, op);
	} else {
		this.stats.subtract += 1;
		// tracer.log("Processing immediate OperandBignum/subtract: " + this._value.toString() + " and " + op._value.toString());
		return new OperandBignum(this._value.subtract(op.value()));
	}
};
OperandBignum.prototype.multiply = function(op, immediate) {
	if (op.constructor === BigInteger)
		op = new OperandBignum(op);

	if (this.chooseDelay(immediate, op)) {
		// tracer.log("Delaying OperandBignum/multiply");
		return new OperandBignum(null, null, OperandBignum.prototype.multiply, this, op);
	} else {
		this.stats.multiply += 1;
		// tracer.log("Processing immediate OperandBignum/multiply: " + this._value.toString() + " and " + op._value.toString());
		return new OperandBignum(this._value.multiply(op.value()));
	}
};

OperandBignum.prototype.clearStats = function() {
	OperandBignum.prototype.stats = {
		add: 0,
		subtract: 0,
		multiply: 0,
		mod: 0,
		toJSON: function() {
			return {
				"add": this.add,
				"subtract": this.subtract,
				"multiply": this.multiply,
				"mod": this.mod
			};
		}
	};
};
OperandBignum.prototype.clearStats();
