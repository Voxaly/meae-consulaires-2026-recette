
// values are Point

function GroupECC(params) {
	GroupCyclic.call(this, {x:"0", y:"1"}, {
		p: 'not used',
		q: params.q,
		g: params.g
	});
}
extend(GroupCyclic, GroupECC);

GroupECC.prototype.buildJSONelement = function(value) {
	// value is a PointExt, convert to Point
	var p = value.toPoint();
	return {
		// x: btoa(hex2bin(fp.toHexString(value.x))),
		// y: btoa(hex2bin(fp.toHexString(value.y)))
		"x": fp.toStringBase(p.x, 36), // or 16 for hexa (or 32 for double hexa)
		"y": fp.toStringBase(p.y, 36)
	};
};

GroupECC.prototype.buildValueFromObject = function(serialized, nocheck) {
	// check container and coordinates type
	if (typeof serialized != 'object' || typeof serialized.x != 'string' || typeof serialized.y != 'string')
		throw new Error("Can't build an ECC group element value from a " + (typeof serialized));

	var newValue = PointExt.prototype.buildFromPoint(Point.prototype.buildFromCoords(serialized));
	// var newValue = Point.prototype.buildFromCoords(serialized);
	if (!nocheck && !this.isMember(newValue))
		throw new Error("This value is not a member of the group");

	return newValue;
};
GroupECC.prototype.isMember = function(value) {
	// check that x and y are > 0 and < P
	// check the Twisted Edward equation -x2 + y2 = 1 + d*x2*y2
	var x2 = fp.S(value.x);
	var y2 = fp.S(value.y);
	if (!fp.E(fp.A(fp.Z(fp.A(fp.M(fp.d, x2, y2), x2), y2), fp.ONE), fp.ZERO))
		return false;
	// check Lagrange
	return GroupCyclic.prototype.isMember.call(this, value);
};
GroupECC.prototype.compare = function(valueA, valueB) {
	// we have no "order in the plane", so just return 0 if equal, 1 else
	return valueA.isEqual(valueB) ? 0 : 1;
};
GroupECC.prototype.compose = function(valueA, valueB) {
	// Mult
	return valueA.multiply(valueB);
};
GroupECC.prototype.composeSelfN = function(valueA, times) {
	// Exp
	return valueA.exponentiate(times);
};
GroupECC.prototype.invert = function(value) {
	// invert y coordinate !
	return value.invert();
};

GroupECC.prototype.isLongOperation = function(operation, value) {
	// the only long operations are exponentiates and serialization of points that don't have a cached point already
	return operation === 'composeSelfN' || (operation === 'toString' && value.point === null);
};
