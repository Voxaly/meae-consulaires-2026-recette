
function elGamalCipherSingle(G, Y, choice, random) {
	// 1. pick a random r € Zq
	// 2. alpha = g^r
	var alpha = G.exponentiate(random);
	// 3. beta = y^r . g^m
	var beta = Y.exponentiate(random).multiply(G.exponentiate(new BigInteger(choice + '')));

	return new CipherText(alpha, beta, choice, random);
}
