
/** @this {OperandString} */
function OperandString(value, operation, op1, op2) {
	// build a resolved Operand
	Operand.call(this, value, operation, op1, op2);
}
extend(Operand, OperandString);

// str is supposed to be an OperandString too (but is converted on the fly if needed)
OperandString.prototype.concat = function(str, immediate) {
	if (typeof str === 'string')
		str = new OperandString(str);

	if (this.chooseDelay(immediate, str)) {
		// tracer.log("Delaying OperandString/concat");
		return new OperandString(null, OperandString.prototype.concat, this, str);
	} else {
		this.stats.concat += 1;
		// tracer.log("Processing immediate OperandString/concat: " + this._value + " and " + str._value);
		return new OperandString(this._value + str._value);
	}
};
// !!! for later, an operation that takes a template (with _ to be replaced) and a list of operands
// this implies that "buildResolutionQueue" needs to be smarter to retrieve the actual list of operands

// sha256 returns a BigInteger
OperandString.prototype.sha256 = function(immediate) {
	if (this.chooseDelay(immediate)) {
		// tracer.log("Delaying OperandString/sha256");
		return new OperandBignum(null, null, OperandString.prototype.sha256, this);
	} else {
		this.stats.sha256 += 1;
		// tracer.log("Processing immediate OperandString/sha256: " + this._value);
		return new OperandBignum(new BigInteger(SHA.create("SHA-256", "TEXT", "HEX").hash(this._value), 16));
	}
};

OperandString.prototype.clearStats = function() {
	OperandString.prototype.stats = {
		sha256: 0,
		concat: 0,
		toJSON: function() {
			return {
				"sha256": this.sha256,
				"concat": this.concat
			};
		}
	};
};
OperandString.prototype.clearStats();
