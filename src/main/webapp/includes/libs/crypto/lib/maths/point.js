
// Point operation is almost never used anymore, all internal computations are done on PointExt

// called with two FP values
/** @this {Point} */
function Point(x, y) {
	this.x = x;
	this.y = y;
}
// Point.prototype.copy = function(point) {
// 	return new Point(this.x, this.y);
// };
// Point.prototype.toString = function() {
// 	// used only during proof computing, for serialization before SHA
// 	return fp.toStringBase(this.x, 10) + '-' + fp.toStringBase(this.y, 10);
// 	// return "[Point: x=" + fp.toHexString(this.x) + ", y=" + fp.toHexString(this.y) + "]";
// };
// Point.prototype.toJSON = function() {
// 	return {x:this.x, y:this.y};
// };
// Point.prototype.isEqual = function(point) {
// 	return fp.E(point.x, this.x) && fp.E(point.y, this.y);
// };
// Point.prototype.compareTo = function(point) {
// 	return this.isEqual(point) ? 0 : 1;
// };
// Point.prototype.multiply = function(p) {
// 	return PointExt.prototype.buildFromPoint(this).multiply(PointExt.prototype.buildFromPoint(p)).toPoint();
// };
// Point.prototype.square = function() {
// 	return PointExt.prototype.buildFromPoint(this).square().toPoint();
// };
// Point.prototype.invert = function() {
// 	return new Point(fp.N(this.x), this.y);
// };
// Point.prototype.divide = function(p) {
// 	return PointExt.prototype.buildFromPoint(this).multiply(PointExt.prototype.buildFromPoint(this.invert())).toPoint();
// };
// Point.prototype.exponentiate = function(exp) {
// 	return PointExt.prototype.buildFromPoint(this).exponentiate(exp).toPoint();
// };
// called with an object with x and y as strings
Point.prototype.buildFromCoords = function(coords) {
	return new Point(fp.fromHexString(coords.x, 36), fp.fromHexString(coords.y, 36));
};

/** @this {PointExt} */
function PointExt(x, y, z, t, point) {
	// all point coordinates are constants (set at creation, never updated)
	this.x = x;
	this.y = y;
	this.z = z;
	this.t = t;
	// cache for the Point value, computed once, if needed.
	this.point = point;
}
PointExt.prototype.copy = function() {
	return new PointExt(this.x, this.y, this.z, this.t);
};
PointExt.prototype.toString = function() {
	// makes sure that we have a point representation ready
	this.toPoint();
	return fp.toStringBase(this.point.x, 10) + '-' + fp.toStringBase(this.point.y, 10);
};
PointExt.prototype.compareTo = function(p) {
	var p1 = this.toPoint();
	var p2 = p.toPoint();
	return fp.E(p1.x, p2.x) && fp.E(p1.y, p2.y) ? 0 : 1;
};
PointExt.prototype.toJSON = function() {
	return {x:this.x, y:this.y, z:this.z, t:this.t};
};
PointExt.prototype.toPoint = function() {
	if (!this.point) {
		// tracer.log("toPoint: run");
		var z = fp.I(this.z);
		this.point = new Point(fp.M(z, this.x), fp.M(z, this.y));
	}
	// else
	// 	tracer.log("toPoint: optimized !");
	return this.point;
};
PointExt.prototype.multiply = function(p) {
	var s = this.staticFp;
	var A = s.A;
	var B = s.B;
	var C = s.C;
	var D = s.D;
	var E = s.E;
	var F = s.F;
	var G = s.G;
	var H = s.H;
	var tmp = s.tmp;
	var f = fp;
	var num = f.baseclass;
	var i;

	// A = (Y1 − X1)(Y2 − X2)
	// f.Z2(this.y, this.x, A);
	// f.Z2(p.y, p.x, tmp);
	for (i = 0; i < 16; i++) {
		A[i] = this.y[i] - this.x[i];
		tmp[i] = p.y[i] - p.x[i];
	}
	f.M2(A, tmp, A);

	// B = (Y1 + X1)(Y2 + X2)
	// f.A2(this.y, this.x, B);
	// f.A2(p.y, p.x, tmp);
	for (i = 0; i < 16; i++) {
		B[i] = this.y[i] + this.x[i];
		tmp[i] = p.y[i] + p.x[i];
	}
	f.M2(B, tmp, B);

	// C = 2 * d * T1 * T2
	f.M2(f.d, this.t, C);
	f.M2(C, p.t, C);
	// f.A2(C, C, C);
	for (i = 0; i < 16; i++)
		C[i] += C[i];

	// D = 2 * Z1 * Z2
	f.M2(this.z, p.z, D);
	// f.A2(D, D, D);
	// E = B − A
	// f.Z2(B, A, E);
	// F = D − C
	// f.Z2(D, C, F);
	// G = D + C
	// f.A2(D, C, G);
	// H = B + A
	// f.A2(B, A, H);
	for (i = 0; i < 16; i++) {
		D[i] += D[i];
		E[i] = B[i] - A[i];
		F[i] = D[i] - C[i];
		G[i] = D[i] + C[i];
		H[i] = B[i] + A[i];
	}

	// 5. R.X = EF, R.Y = GH, R.Z = FG, R.T = EH
	return new PointExt(f.M2(E, F, new num(16)), f.M2(G, H, new num(16)), f.M2(F, G, new num(16)), f.M2(E, H, new num(16)));
};
PointExt.prototype.square = function() {
	var s = this.staticFp;
	var A = s.A;
	var B = s.B;
	var D = s.D;
	var E = s.E;
	var F = s.F;
	var G = s.G;
	var H = s.H;
	var f = fp;
	var num = f.baseclass;
	var i;

	// 2. A = X1²
	f.S2(this.x, A);

	// B = Y1²
	f.S2(this.y, B);

	// D = −A
	// f.N2(A, D);
	// 3. E = (X1 + Y1)² − A − B
	// f.A2(this.x, this.y, E);
	for (i = 0; i < 16; i++) {
		D[i] = -A[i];
		E[i] = this.x[i] + this.y[i];
	}
	f.S2(E, E);
	// f.Z2(E, A, E);
	// f.Z2(E, B, E);
	// 3.1 G = D + B
	// f.A2(D, B, G);
	// 3.3 H = D − B
	// f.Z2(D, B, H);

	for (i = 0; i < 16; i++) {
		E[i] -= A[i] + B[i];
		G[i] = D[i] + B[i];
		H[i] = D[i] - B[i];
	}

	// isOne is a specialized (and much cheaper) version of f.E
	if (f.isOne(this.z)) {
		var tmp = s.tmp;

		// 3.2 G2 = G - 2
		// f.Z2(G, f.TWO, tmp);
		for (i = 0; i < 16; i++)
			tmp[i] = G[i] - f.TWO[i];

		// 4. X3 = E*(G-2), Y3 = G*H, Z3 = G*(G-2), T3 = E*H,
		return new PointExt(f.M2(E, tmp, new num(16)), f.M2(G, H, new num(16)), f.M2(G, tmp, new num(16)), f.M2(E, H, new num(16)));
	} else {
		var C = s.C;

		// C = 2*Z1²
		f.S2(this.z, C);
		// f.A2(C, C, C);
		// 3.2 F = G − C
		// f.Z2(G, C, F);
		for (i = 0; i < 16; i++) {
			C[i] += C[i];
			F[i] = G[i] - C[i];
		}

		// 4. R.X = EF, R.Y = GH, R.Z = FG, R.T = EH
		return new PointExt(f.M2(E, F, new num(16)), f.M2(G, H, new num(16)), f.M2(F, G, new num(16)), f.M2(E, H, new num(16)));
	}
};

PointExt.prototype.invert = function() {
	return new PointExt(fp.N(this.x), this.y, this.z, fp.N(this.t));
};

// exp is a BigInteger
PointExt.prototype.exponentiate = function(exp) {
	// array of 2^windowsize (=16) PointExt
	var t = new Array(this.expwindowmask + 1);
	// 4. T = [one_ext,Q]
	t[0] = this.ONE;
	t[1] = this;

	// 5. Pour i de 2 à 1 << windowsize − 2 par pas de 2 :
	for (var i=2; i <= (this.expwindowmask - 1); i += 2) {
		// (a) sqr_ext(T[i], T[i/2])
		t[i] = t[i/2].square();

		// (b) mul_ext(T[i + 1], T[i],Q)
		t[i+1] = t[i].multiply(this);
	}

	// 6. S = one_ext
	var s = this.ONE;

	// 7. Pour i allant de dbitzise(n)/windowsizee − 1 à 0 par pas de -1 :
	var l = Math.ceil(exp.bitLength() / this.expwindowsize);
	for (var i=l-1; i >= 0; i -= 1) {
		// (a) mul_ext(S, S, T[n >> (i * windowsize)&windowmask])
		var index = exp.shiftRight(i * this.expwindowsize).and(this.expwindowmaskBn);
		s = s.multiply(t[index.byteValue()]);

		// Si i !=0, répéter windowsize fois : sqr_ext(S, S)
		if (i != 0)
			for (var j = 0; j < this.expwindowsize; j++)
				s = s.square();
	}
	return s;
};

// static allocation for intermediate results
// used by multiply and square, which are mutually exclusive and don't call each other
PointExt.prototype.staticFp = {
	A: new fp.baseclass(16),
	B: new fp.baseclass(16),
	C: new fp.baseclass(16),
	D: new fp.baseclass(16),
	E: new fp.baseclass(16),
	F: new fp.baseclass(16),
	G: new fp.baseclass(16),
	H: new fp.baseclass(16),
	tmp: new fp.baseclass(16)
};

PointExt.prototype.buildFromPoint = function(point) {
	return new PointExt(point.x, point.y, fp.ONE, fp.M(point.x, point.y), point);
};

PointExt.prototype.ONE = PointExt.prototype.buildFromPoint({x:fp.ZERO, y:fp.ONE})
PointExt.prototype.expwindowsize = 4;
PointExt.prototype.expwindowmask = (1 << PointExt.prototype.expwindowsize) - 1;
PointExt.prototype.expwindowmaskBn = new BigInteger('' + PointExt.prototype.expwindowmask);
