
//------------------------------------------------------------------------
// the constructor expects the modulo as a BigInteger
/** @this {GroupBigIntMod} */
function GroupBigIntMod(params) {
	// p is the modulo
	GroupCyclic.call(this, "1", params);
}
extend(GroupCyclic, GroupBigIntMod);

GroupBigIntMod.prototype.buildValueFromObject = function(serialized) {
	if (typeof serialized != 'string')
		throw new Error("Can't build a BigIntMod group element value from a " + (typeof serialized));
	// group members are serialized as hex strings, values are BigInteger
	return new BigInteger(serialized, 36);
}
// not sure how to check if a given value is a member of that group. Check that < modulo is not enough
GroupBigIntMod.prototype.isMember = function(value) { return true; }
// GroupBigIntMod.prototype.isMember = function(value) {
// 	if (value.compareTo(this.modulo) > 0)
// 		return false;
// 	return GroupCyclic.prototype.isMember.call(this, value);
// }
GroupBigIntMod.prototype.compare = function(valueA, valueB) {
	return valueA.compareTo(valueB);
}
GroupBigIntMod.prototype.compose = function(valueA, valueB) {
	// tracer.log(`Calling multiply with\n- ${valueA.toString()}\n- ${valueB.toString()}\n- ${this.modulo.toString()}`);
	return valueA.multiply(valueB).mod(this.modulo);
}
GroupBigIntMod.prototype.composeSelfN = function(valueA, times) {
	// tracer.log(`Calling modPow with\n- value ${valueA.toString()}\n- times ${times}\n- mod ${this.modulo.toString()}`);
	return valueA.modPow(times, this.modulo);
}
GroupBigIntMod.prototype.invert = function(value) {
	return value.modInverse(this.modulo);
}
