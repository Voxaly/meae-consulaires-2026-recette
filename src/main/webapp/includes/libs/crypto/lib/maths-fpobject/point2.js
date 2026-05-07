
// called with two FP values
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.copy = function(point) {
	return new Point(this.x, this.y);
};
Point.prototype.toString = function() {
	// used only during proof computing, for serialization before SHA
	return fp.toStringBase(this.x, 10) + '-' + fp.toStringBase(this.y, 10);
	// return "[Point: x=" + fp.toHexString(this.x) + ", y=" + fp.toHexString(this.y) + "]";
};
Point.prototype.toJSON = function() {
	return {x:this.x, y:this.y};
};
Point.prototype.isEqual = function(point) {
	return fp.E(point.x, this.x) && fp.E(point.y, this.y);
};
Point.prototype.compareTo = function(point) {
	return this.isEqual(point) ? 0 : 1;
};
Point.prototype.multiply = function(p) {
	return PointExt.prototype.buildFromPoint(this).multiply(PointExt.prototype.buildFromPoint(p)).toPoint();
};
Point.prototype.square = function() {
	return PointExt.prototype.buildFromPoint(this).square().toPoint();
};
Point.prototype.invert = function() {
	return new Point(fp.N(this.x), this.y);
};
Point.prototype.divide = function(p) {
	return PointExt.prototype.buildFromPoint(this).multiply(PointExt.prototype.buildFromPoint(this.invert())).toPoint();
};
Point.prototype.exponentiate = function(exp) {
	return PointExt.prototype.buildFromPoint(this).exponentiate(exp).toPoint();
};
// called with an object with x and y as strings
Point.prototype.buildFromCoords = function(coords) {
	return new Point(fp.fromHexString(coords.x, 36), fp.fromHexString(coords.y, 36));
};

function PointExt(x, y, z, t) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.t = t;
	this.point = null;
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
	return fp.E(p1.x, p2.x) && fp.E(p1.y, p2.y);
};
PointExt.prototype.toJSON = function() {
	return {x:this.x, y:this.y, z:this.z, t:this.t};
};
PointExt.prototype.toPoint = function() {
	if (!this.point) {
		// tracer.log("toPoint: run");
		var z = fp.I2(this.z, new fpnum());
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
	var T = s.T;
	var f = fp;
	var tx = this.x;
	var ty = this.y;

	// A = (Y1 − X1)(Y2 − X2)
	// f.Z2(this.y, this.x, A);
	A.a00 = ty.a00 - tx.a00;
	A.a01 = ty.a01 - tx.a01;
	A.a02 = ty.a02 - tx.a02;
	A.a03 = ty.a03 - tx.a03;
	A.a04 = ty.a04 - tx.a04;
	A.a05 = ty.a05 - tx.a05;
	A.a06 = ty.a06 - tx.a06;
	A.a07 = ty.a07 - tx.a07;
	A.a08 = ty.a08 - tx.a08;
	A.a09 = ty.a09 - tx.a09;
	A.a10 = ty.a10 - tx.a10;
	A.a11 = ty.a11 - tx.a11;
	A.a12 = ty.a12 - tx.a12;
	A.a13 = ty.a13 - tx.a13;
	A.a14 = ty.a14 - tx.a14;
	A.a15 = ty.a15 - tx.a15;

	// f.Z2(p.y, p.x, T);
	T.a00 = p.y.a00 - p.x.a00;
	T.a01 = p.y.a01 - p.x.a01;
	T.a02 = p.y.a02 - p.x.a02;
	T.a03 = p.y.a03 - p.x.a03;
	T.a04 = p.y.a04 - p.x.a04;
	T.a05 = p.y.a05 - p.x.a05;
	T.a06 = p.y.a06 - p.x.a06;
	T.a07 = p.y.a07 - p.x.a07;
	T.a08 = p.y.a08 - p.x.a08;
	T.a09 = p.y.a09 - p.x.a09;
	T.a10 = p.y.a10 - p.x.a10;
	T.a11 = p.y.a11 - p.x.a11;
	T.a12 = p.y.a12 - p.x.a12;
	T.a13 = p.y.a13 - p.x.a13;
	T.a14 = p.y.a14 - p.x.a14;
	T.a15 = p.y.a15 - p.x.a15;

	f.M2(A, T, A);

	// B = (Y1 + X1)(Y2 + X2)
	// f.A2(this.y, tx, B);
	B.a00 = ty.a00 + tx.a00;
	B.a01 = ty.a01 + tx.a01;
	B.a02 = ty.a02 + tx.a02;
	B.a03 = ty.a03 + tx.a03;
	B.a04 = ty.a04 + tx.a04;
	B.a05 = ty.a05 + tx.a05;
	B.a06 = ty.a06 + tx.a06;
	B.a07 = ty.a07 + tx.a07;
	B.a08 = ty.a08 + tx.a08;
	B.a09 = ty.a09 + tx.a09;
	B.a10 = ty.a10 + tx.a10;
	B.a11 = ty.a11 + tx.a11;
	B.a12 = ty.a12 + tx.a12;
	B.a13 = ty.a13 + tx.a13;
	B.a14 = ty.a14 + tx.a14;
	B.a15 = ty.a15 + tx.a15;

	// f.A2(p.y, p.x, T);
	T.a00 = p.y.a00 + p.x.a00;
	T.a01 = p.y.a01 + p.x.a01;
	T.a02 = p.y.a02 + p.x.a02;
	T.a03 = p.y.a03 + p.x.a03;
	T.a04 = p.y.a04 + p.x.a04;
	T.a05 = p.y.a05 + p.x.a05;
	T.a06 = p.y.a06 + p.x.a06;
	T.a07 = p.y.a07 + p.x.a07;
	T.a08 = p.y.a08 + p.x.a08;
	T.a09 = p.y.a09 + p.x.a09;
	T.a10 = p.y.a10 + p.x.a10;
	T.a11 = p.y.a11 + p.x.a11;
	T.a12 = p.y.a12 + p.x.a12;
	T.a13 = p.y.a13 + p.x.a13;
	T.a14 = p.y.a14 + p.x.a14;
	T.a15 = p.y.a15 + p.x.a15;

	f.M2(B, T, B);

	// C = 2 * d * T1 * T2
	f.M2(f.d, this.t, C);
	f.M2(C, p.t, C);
	// f.A2(C, C, C);
	C.a00 = C.a00 + C.a00;
	C.a01 = C.a01 + C.a01;
	C.a02 = C.a02 + C.a02;
	C.a03 = C.a03 + C.a03;
	C.a04 = C.a04 + C.a04;
	C.a05 = C.a05 + C.a05;
	C.a06 = C.a06 + C.a06;
	C.a07 = C.a07 + C.a07;
	C.a08 = C.a08 + C.a08;
	C.a09 = C.a09 + C.a09;
	C.a10 = C.a10 + C.a10;
	C.a11 = C.a11 + C.a11;
	C.a12 = C.a12 + C.a12;
	C.a13 = C.a13 + C.a13;
	C.a14 = C.a14 + C.a14;
	C.a15 = C.a15 + C.a15;

	// D = 2 * Z1 * Z2
	f.M2(this.z, p.z, D);
	// f.A2(D, D, D);
	D.a00 = D.a00 + D.a00;
	D.a01 = D.a01 + D.a01;
	D.a02 = D.a02 + D.a02;
	D.a03 = D.a03 + D.a03;
	D.a04 = D.a04 + D.a04;
	D.a05 = D.a05 + D.a05;
	D.a06 = D.a06 + D.a06;
	D.a07 = D.a07 + D.a07;
	D.a08 = D.a08 + D.a08;
	D.a09 = D.a09 + D.a09;
	D.a10 = D.a10 + D.a10;
	D.a11 = D.a11 + D.a11;
	D.a12 = D.a12 + D.a12;
	D.a13 = D.a13 + D.a13;
	D.a14 = D.a14 + D.a14;
	D.a15 = D.a15 + D.a15;

	// E = B − A
	// f.Z2(B, A, E);
	E.a00 = B.a00 - A.a00;
	E.a01 = B.a01 - A.a01;
	E.a02 = B.a02 - A.a02;
	E.a03 = B.a03 - A.a03;
	E.a04 = B.a04 - A.a04;
	E.a05 = B.a05 - A.a05;
	E.a06 = B.a06 - A.a06;
	E.a07 = B.a07 - A.a07;
	E.a08 = B.a08 - A.a08;
	E.a09 = B.a09 - A.a09;
	E.a10 = B.a10 - A.a10;
	E.a11 = B.a11 - A.a11;
	E.a12 = B.a12 - A.a12;
	E.a13 = B.a13 - A.a13;
	E.a14 = B.a14 - A.a14;
	E.a15 = B.a15 - A.a15;

	// F = D − C
	// f.Z2(D, C, F);
	F.a00 = D.a00 - C.a00;
	F.a01 = D.a01 - C.a01;
	F.a02 = D.a02 - C.a02;
	F.a03 = D.a03 - C.a03;
	F.a04 = D.a04 - C.a04;
	F.a05 = D.a05 - C.a05;
	F.a06 = D.a06 - C.a06;
	F.a07 = D.a07 - C.a07;
	F.a08 = D.a08 - C.a08;
	F.a09 = D.a09 - C.a09;
	F.a10 = D.a10 - C.a10;
	F.a11 = D.a11 - C.a11;
	F.a12 = D.a12 - C.a12;
	F.a13 = D.a13 - C.a13;
	F.a14 = D.a14 - C.a14;
	F.a15 = D.a15 - C.a15;

	// G = D + C
	// f.A2(D, C, G);
	G.a00 = D.a00 + C.a00;
	G.a01 = D.a01 + C.a01;
	G.a02 = D.a02 + C.a02;
	G.a03 = D.a03 + C.a03;
	G.a04 = D.a04 + C.a04;
	G.a05 = D.a05 + C.a05;
	G.a06 = D.a06 + C.a06;
	G.a07 = D.a07 + C.a07;
	G.a08 = D.a08 + C.a08;
	G.a09 = D.a09 + C.a09;
	G.a10 = D.a10 + C.a10;
	G.a11 = D.a11 + C.a11;
	G.a12 = D.a12 + C.a12;
	G.a13 = D.a13 + C.a13;
	G.a14 = D.a14 + C.a14;
	G.a15 = D.a15 + C.a15;

	// H = B + A
	// f.A2(B, A, H);
	H.a00 = B.a00 + A.a00;
	H.a01 = B.a01 + A.a01;
	H.a02 = B.a02 + A.a02;
	H.a03 = B.a03 + A.a03;
	H.a04 = B.a04 + A.a04;
	H.a05 = B.a05 + A.a05;
	H.a06 = B.a06 + A.a06;
	H.a07 = B.a07 + A.a07;
	H.a08 = B.a08 + A.a08;
	H.a09 = B.a09 + A.a09;
	H.a10 = B.a10 + A.a10;
	H.a11 = B.a11 + A.a11;
	H.a12 = B.a12 + A.a12;
	H.a13 = B.a13 + A.a13;
	H.a14 = B.a14 + A.a14;
	H.a15 = B.a15 + A.a15;

	// 5. R.X = EF, R.Y = GH, R.Z = FG, R.T = EH
	return new PointExt(f.M2(E, F, new fpnum()), f.M2(G, H, new fpnum()), f.M2(F, G, new fpnum()), f.M2(E, H, new fpnum()));
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
	var tx = this.x;
	var ty = this.y;

	// 2. A = X1²
	f.S2(tx, A);

	// B = Y1²
	f.S2(ty, B);

	// D = −A
	// f.N2(A, D);
	D.a00 = -A.a00;
	D.a01 = -A.a01;
	D.a02 = -A.a02;
	D.a03 = -A.a03;
	D.a04 = -A.a04;
	D.a05 = -A.a05;
	D.a06 = -A.a06;
	D.a07 = -A.a07;
	D.a08 = -A.a08;
	D.a09 = -A.a09;
	D.a10 = -A.a10;
	D.a11 = -A.a11;
	D.a12 = -A.a12;
	D.a13 = -A.a13;
	D.a14 = -A.a14;
	D.a15 = -A.a15;

	// 3. E = (X1 + Y1)² − A − B
	// f.A2(this.x, this.y, E);
	E.a00 = tx.a00 + ty.a00;
	E.a01 = tx.a01 + ty.a01;
	E.a02 = tx.a02 + ty.a02;
	E.a03 = tx.a03 + ty.a03;
	E.a04 = tx.a04 + ty.a04;
	E.a05 = tx.a05 + ty.a05;
	E.a06 = tx.a06 + ty.a06;
	E.a07 = tx.a07 + ty.a07;
	E.a08 = tx.a08 + ty.a08;
	E.a09 = tx.a09 + ty.a09;
	E.a10 = tx.a10 + ty.a10;
	E.a11 = tx.a11 + ty.a11;
	E.a12 = tx.a12 + ty.a12;
	E.a13 = tx.a13 + ty.a13;
	E.a14 = tx.a14 + ty.a14;
	E.a15 = tx.a15 + ty.a15;

	f.S2(E, E);
	// f.Z2(E, A, E);
	// f.Z2(E, B, E);
	E.a00 -= A.a00 + B.a00;
	E.a01 -= A.a01 + B.a01;
	E.a02 -= A.a02 + B.a02;
	E.a03 -= A.a03 + B.a03;
	E.a04 -= A.a04 + B.a04;
	E.a05 -= A.a05 + B.a05;
	E.a06 -= A.a06 + B.a06;
	E.a07 -= A.a07 + B.a07;
	E.a08 -= A.a08 + B.a08;
	E.a09 -= A.a09 + B.a09;
	E.a10 -= A.a10 + B.a10;
	E.a11 -= A.a11 + B.a11;
	E.a12 -= A.a12 + B.a12;
	E.a13 -= A.a13 + B.a13;
	E.a14 -= A.a14 + B.a14;
	E.a15 -= A.a15 + B.a15;

	// 3.1 G = D + B
	// f.A2(D, B, G);
	G.a00 = D.a00 + B.a00;
	G.a01 = D.a01 + B.a01;
	G.a02 = D.a02 + B.a02;
	G.a03 = D.a03 + B.a03;
	G.a04 = D.a04 + B.a04;
	G.a05 = D.a05 + B.a05;
	G.a06 = D.a06 + B.a06;
	G.a07 = D.a07 + B.a07;
	G.a08 = D.a08 + B.a08;
	G.a09 = D.a09 + B.a09;
	G.a10 = D.a10 + B.a10;
	G.a11 = D.a11 + B.a11;
	G.a12 = D.a12 + B.a12;
	G.a13 = D.a13 + B.a13;
	G.a14 = D.a14 + B.a14;
	G.a15 = D.a15 + B.a15;

	// 3.3 H = D − B
	// f.Z2(D, B, H);
	H.a00 = D.a00 - B.a00;
	H.a01 = D.a01 - B.a01;
	H.a02 = D.a02 - B.a02;
	H.a03 = D.a03 - B.a03;
	H.a04 = D.a04 - B.a04;
	H.a05 = D.a05 - B.a05;
	H.a06 = D.a06 - B.a06;
	H.a07 = D.a07 - B.a07;
	H.a08 = D.a08 - B.a08;
	H.a09 = D.a09 - B.a09;
	H.a10 = D.a10 - B.a10;
	H.a11 = D.a11 - B.a11;
	H.a12 = D.a12 - B.a12;
	H.a13 = D.a13 - B.a13;
	H.a14 = D.a14 - B.a14;
	H.a15 = D.a15 - B.a15;

	// isOne is a specialized (and much cheaper) version of f.E
	if (f.isOne(this.z)) {
		var T = s.T;

		// 3.2 G2 = G - 2
		// f.Z2(G, f.TWO, T);
		T.a00 = G.a00 - 2;
		T.a01 = G.a01;
		T.a02 = G.a02;
		T.a03 = G.a03;
		T.a04 = G.a04;
		T.a05 = G.a05;
		T.a06 = G.a06;
		T.a07 = G.a07;
		T.a08 = G.a08;
		T.a09 = G.a09;
		T.a10 = G.a10;
		T.a11 = G.a11;
		T.a12 = G.a12;
		T.a13 = G.a13;
		T.a14 = G.a14;
		T.a15 = G.a15;

		// 4. X3 = E*(G-2), Y3 = G*H, Z3 = G*(G-2), T3 = E*H,
		return new PointExt(f.M2(E, T, new fpnum()), f.M2(G, H, new fpnum()), f.M2(G, T, new fpnum()), f.M2(E, H, new fpnum()));
	} else {
		var C = s.C;

		// C = 2*Z1²
		f.S2(this.z, C);
		// f.A2(C, C, C);
		C.a00 += C.a00;
		C.a01 += C.a01;
		C.a02 += C.a02;
		C.a03 += C.a03;
		C.a04 += C.a04;
		C.a05 += C.a05;
		C.a06 += C.a06;
		C.a07 += C.a07;
		C.a08 += C.a08;
		C.a09 += C.a09;
		C.a10 += C.a10;
		C.a11 += C.a11;
		C.a12 += C.a12;
		C.a13 += C.a13;
		C.a14 += C.a14;
		C.a15 += C.a15;

		// 3.2 F = G − C
		// f.Z2(G, C, F);
		F.a00 = G.a00 - C.a00;
		F.a01 = G.a01 - C.a01;
		F.a02 = G.a02 - C.a02;
		F.a03 = G.a03 - C.a03;
		F.a04 = G.a04 - C.a04;
		F.a05 = G.a05 - C.a05;
		F.a06 = G.a06 - C.a06;
		F.a07 = G.a07 - C.a07;
		F.a08 = G.a08 - C.a08;
		F.a09 = G.a09 - C.a09;
		F.a10 = G.a10 - C.a10;
		F.a11 = G.a11 - C.a11;
		F.a12 = G.a12 - C.a12;
		F.a13 = G.a13 - C.a13;
		F.a14 = G.a14 - C.a14;
		F.a15 = G.a15 - C.a15;

		// 4. R.X = EF, R.Y = GH, R.Z = FG, R.T = EH
		return new PointExt(f.M2(E, F, new fpnum()), f.M2(G, H, new fpnum()), f.M2(F, G, new fpnum()), f.M2(E, H, new fpnum()));
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
	A: new fpnum(),
	B: new fpnum(),
	C: new fpnum(),
	D: new fpnum(),
	E: new fpnum(),
	F: new fpnum(),
	G: new fpnum(),
	H: new fpnum(),
	T: new fpnum()
};

PointExt.prototype.buildFromPoint = function(point) {
	return new PointExt(point.x, point.y, fp.ONE, fp.M(point.x, point.y));
};

PointExt.prototype.ONE = PointExt.prototype.buildFromPoint({x:fp.ZERO, y:fp.ONE})
PointExt.prototype.expwindowsize = 4;
PointExt.prototype.expwindowmask = (1 << PointExt.prototype.expwindowsize) - 1;
PointExt.prototype.expwindowmaskBn = new BigInteger('' + PointExt.prototype.expwindowmask);
