/** @this {GroupParameters} */
function GroupParameters(groupParameters, publicKey) {

	// numeric parameters, represented as hex strings
	// Q: order of the group -> BigInteger
	// P: modulo of the group -> BigInteger
	// G: generator -> GroupElement
	// Y: public key of election -> GroupElement

	switch(groupParameters.type) {
		case 'ZpZ':
		case 'Z/pZ':
			this.group = new GroupBigIntMod(groupParameters);
			break;
		case 'ECC':
		case 'ECC25519':
			this.group = new GroupECC(groupParameters);
			break;
		default:
			throw new Error("Missing group definition for " + groupParameters.type)
	}

	this.G = this.group.generator;
	this.Q = this.group.order;
	this.P = this.group.modulo;
	this.Y = this.group.newElement(this.group.buildValueFromObject(publicKey, true), 'Y');
}
