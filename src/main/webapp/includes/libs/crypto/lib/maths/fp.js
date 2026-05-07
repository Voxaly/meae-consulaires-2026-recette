/** @this {FPfast} */
function FPfast() {
	// taken from nacl-fast: car25519, sel25519, packTo25519, A, Z, M, S, I

	// typed arrays are not available on IE 7-9. But a plain array of Numbers works too (with abysmal perfs on Floor).
	var numcls = (typeof Float64Array != "undefined") ? Float64Array : Array;

	this.ZERO = ArrayFill(new numcls(16), 0);

	this.ONE = ArrayFill(new numcls(16), 0);
	this.ONE[0] = 1;

	this.TWO = ArrayFill(new numcls(16), 0);
	this.TWO[0] = 2;
	
	//pour optimiser le calcul Math.floor(x) remplacé par  (floorC + (x - floorhalf))) attention parenthésage important 
	var floorC = 6755399441055744.0;       // 2^52+2^51 
    var floorhalf = 0.5 - 1/131072.0;      // 2^(-1) - 2^(-17) 


	this.check = function(a) {
		var i;
		// 1. Check if all slices do not flow out of 16 bits
		for (i = 0; i < 16; i++)
			if (a[i] < 0 || a[i] >= 65536)
				return false;
		// 2-3-4 just check that we're < P  (=2^255-19)
		// 2. if a[15] < a^15-1, already ok
		if (a[15] < 32767)
			return true;
		// 3. if any [1-14] slice is not 0xffff, it's ok
		for (i=14; i>0; i--)
			if (a[i] < 65535)
				return true;
		// 4. if last slice is < 65517, it ok
		if (a[0] < 65517)
			return true;
		return false;
	};
	

	function car25519(o) {
		var i, v, c = 1;
		for (i = 0; i < 16; i++) {
			v = o[i] + c + 65535;
			c = Math.floor(v / 65536);
			o[i] = v - c * 65536;
		}
		o[0] += c-1 + 37 * (c-1);
	}

	function sel25519(p, q, b) {
		var t, c = ~(b-1);
		for (var i = 0; i < 16; i++) {
			t = c & (p[i] ^ q[i]);
			p[i] ^= t;
			q[i] ^= t;
		}
	}

	// this is the pack25519 function, modified to output into a given number, not a byte array
	function reduce25519(n) {
		car25519(n);
		car25519(n);
		car25519(n);
		var b, m = new numcls(16);
		for (var j = 0; j < 2; j++) {
			m[0] = n[0] - 0xffed;
			for (var i = 1; i < 15; i++) {
				m[i] = n[i] - 0xffff - ((m[i-1]>>16) & 1);
				m[i-1] &= 0xffff;
			}
			m[15] = n[15] - 0x7fff - ((m[14]>>16) & 1);
			b = (m[15]>>16) & 1;
			m[14] &= 0xffff;
			sel25519(n, m, 1-b);
		}
	}

	this.toHexString = function(a, noreduction) {
		var str = '';
		if (!noreduction)
			reduce25519(a);
		for (var i=15; i>=0; i--) {
			var b = '000' + a[i].toString(16);
			str += b.substr(b.length-4);
		}
		return str;
	};
	// probably costly, but we only do it for proof generation
	this.toStringBase = function(a, radix) {
		var s = this.toHexString(a);
		if (radix !== 16)
			s = (new BigInteger(s, 16)).toString(radix);
		return s;
	};

	this.fromHexString = function(str, radix, nocheck) {
		var rdx = radix || 16;
		// convert to base 16 if not already
		var str1 = rdx === 16 ? str : (new BigInteger(str, radix)).toString(16);
		var str2 = '0000000000000000000000000000000000000000000000000000000000000000' + str1;
		str2 = str2.substr(str2.length - 64);
		var o = new numcls(16);
		for (var i=0; i<16; i++)
			o[15-i] = parseInt(str2.substr(i*4, 4), 16);
		if (!nocheck && !this.check(o))
			throw new Error("This number is to large: " + str);
		return o;
	};
	this.d = this.fromHexString("52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3");
	// p is only used for external reference, we never use it directly. It is hardcoded in the functions whenever useful (eg: check)
	this.p = this.fromHexString("7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed", null, true);

	function addTo(a, b, o) {
		for (var i = 0; i < 16; i++)
			o[i] = a[i] + b[i];
		return o;
	}
	function add(a, b) {
		return addTo(a, b, new numcls(16));
	}

	function subtractTo(a, b, o) {
		for (var i = 0; i < 16; i++)
			o[i] = a[i] - b[i];
		return o;
	}
	function subtract(a, b) {
		return subtractTo(a, b, new numcls(16));
	}

	function squareTo(a, o) {
		var v, c, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15,
		a00 = a[0],  a01 = a[1],  a02 = a[2],  a03 = a[3],
		a04 = a[4],  a05 = a[5],  a06 = a[6],  a07 = a[7],
		a08 = a[8],  a09 = a[9],  a10 = a[10], a11 = a[11],
		a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

		t0  = a00*a00+38*(2*(a01*a15+a02*a14+a03*a13+a04*a12+a05*a11+a06*a10+a07*a09)+a08*a08);
		t1  = 2*a00*a01+38*(2*(a02*a15+a03*a14+a04*a13+a05*a12+a06*a11+a07*a10+a08*a09));
		t2  = 2*(a00*a02)+a01*a01+38*(2*(a03*a15+a04*a14+a05*a13+a06*a12+a07*a11+a08*a10)+a09*a09);
		t3  = 2*(a00*a03+a01*a02)+38*(2*(a04*a15+a05*a14+a06*a13+a07*a12+a08*a11+a09*a10));
		t4  = 2*(a00*a04+a01*a03)+a02*a02+38*(2*(a05*a15+a06*a14+a07*a13+a08*a12+a09*a11)+a10*a10);
		t5  = 2*(a00*a05+a01*a04+a02*a03)+38*(2*(a06*a15+a07*a14+a08*a13+a09*a12+a10*a11));
		t6  = 2*(a00*a06+a01*a05+a02*a04)+a03*a03+38*(2*(a07*a15+a08*a14+a09*a13+a10*a12)+a11*a11);
		t7  = 2*(a00*a07+a01*a06+a02*a05+a03*a04)+38*(2*(a08*a15+a09*a14+a10*a13+a11*a12));
		t8  = 2*(a00*a08+a01*a07+a02*a06+a03*a05)+a04*a04+38*(2*(a09*a15+a10*a14+a11*a13)+a12*a12);
		t9  = 2*(a00*a09+a01*a08+a02*a07+a03*a06+a04*a05)+38*(2*(a10*a15+a11*a14+a12*a13));
		t10 = 2*(a00*a10+a01*a09+a02*a08+a03*a07+a04*a06)+a05*a05+38*(2*(a11*a15+a12*a14)+a13*a13);
		t11 = 2*(a00*a11+a01*a10+a02*a09+a03*a08+a04*a07+a05*a06)+38*(2*(a12*a15+a13*a14));
		t12 = 2*(a00*a12+a01*a11+a02*a10+a03*a09+a04*a08+a05*a07)+a06*a06+38*(2*(a13*a15)+a14*a14);
		t13 = 2*(a00*a13+a01*a12+a02*a11+a03*a10+a04*a09+a05*a08+a06*a07)+38*(2*(a14*a15));
		t14 = 2*(a00*a14+a01*a13+a02*a12+a03*a11+a04*a10+a05*a09+a06*a08)+a07*a07+38*(a15*a15);
		t15 = 2*(a00*a15+a01*a14+a02*a13+a03*a12+a04*a11+a05*a10+a06*a09+a07*a08);

		// car:
		// var i, v, c = 1;
		// for (i = 0; i < 16; i++) {
		// 	v = o[i] + c + 65535;
		// 	c = Math.floor(v / 65536);
		// 	o[i] = v - c * 65536;
		// }
		// o[0] += c-1 + 37 * (c-1);

		
		/**
		 * Le math.floor() a été remplacé par un 0 | pour des raisons de performances.
		 * Voir document de pierrick Gaudry - EVOTE_APP_SPEC_CRY_analyseJSMathFloor.pdf
		 */
		
		// first car
		c = 1;
		v =  t0 + c + 65535; c = 0|(v / 65536);  t0 = v - c * 65536;
		v =  t1 + c + 65535; c = 0|(v / 65536);  t1 = v - c * 65536;
		v =  t2 + c + 65535; c = 0|(v / 65536);  t2 = v - c * 65536;
		v =  t3 + c + 65535; c = 0|(v / 65536);  t3 = v - c * 65536;
		v =  t4 + c + 65535; c = 0|(v / 65536);  t4 = v - c * 65536;
		v =  t5 + c + 65535; c = 0|(v / 65536);  t5 = v - c * 65536;
		v =  t6 + c + 65535; c = 0|(v / 65536);  t6 = v - c * 65536;
		v =  t7 + c + 65535; c = 0|(v / 65536);  t7 = v - c * 65536;
		v =  t8 + c + 65535; c = 0|(v / 65536);  t8 = v - c * 65536;
		v =  t9 + c + 65535; c = 0|(v / 65536);  t9 = v - c * 65536;
		v = t10 + c + 65535; c = 0|(v / 65536); t10 = v - c * 65536;
		v = t11 + c + 65535; c = 0|(v / 65536); t11 = v - c * 65536;
		v = t12 + c + 65535; c = 0|(v / 65536); t12 = v - c * 65536;
		v = t13 + c + 65535; c = 0|(v / 65536); t13 = v - c * 65536;
		v = t14 + c + 65535; c = 0|(v / 65536); t14 = v - c * 65536;
		v = t15 + c + 65535; c = 0|(v / 65536); t15 = v - c * 65536;
		t0 += 38 * (c-1);

		// second car
		c = 1;
		v =  t0 + c + 65535; c = 0|(v / 65536);  t0 = v - c * 65536;
		v =  t1 + c + 65535; c = 0|(v / 65536);  t1 = v - c * 65536;
		v =  t2 + c + 65535; c = 0|(v / 65536);  t2 = v - c * 65536;
		v =  t3 + c + 65535; c = 0|(v / 65536);  t3 = v - c * 65536;
		v =  t4 + c + 65535; c = 0|(v / 65536);  t4 = v - c * 65536;
		v =  t5 + c + 65535; c = 0|(v / 65536);  t5 = v - c * 65536;
		v =  t6 + c + 65535; c = 0|(v / 65536);  t6 = v - c * 65536;
		v =  t7 + c + 65535; c = 0|(v / 65536);  t7 = v - c * 65536;
		v =  t8 + c + 65535; c = 0|(v / 65536);  t8 = v - c * 65536;
		v =  t9 + c + 65535; c = 0|(v / 65536);  t9 = v - c * 65536;
		v = t10 + c + 65535; c = 0|(v / 65536); t10 = v - c * 65536;
		v = t11 + c + 65535; c = 0|(v / 65536); t11 = v - c * 65536;
		v = t12 + c + 65535; c = 0|(v / 65536); t12 = v - c * 65536;
		v = t13 + c + 65535; c = 0|(v / 65536); t13 = v - c * 65536;
		v = t14 + c + 65535; c = 0|(v / 65536); t14 = v - c * 65536;
		v = t15 + c + 65535; c = 0|(v / 65536); t15 = v - c * 65536;
  		t0 += 38 * (c-1);

		o[ 0] = t0;  o[ 1] = t1;  o[ 2] = t2;  o[ 3] = t3;
		o[ 4] = t4;  o[ 5] = t5;  o[ 6] = t6;  o[ 7] = t7;
		o[ 8] = t8;  o[ 9] = t9;  o[10] = t10; o[11] = t11;
		o[12] = t12; o[13] = t13; o[14] = t14; o[15] = t15;
		return o;
	}
	function square(a) {
		return multiplyTo(a, a, new numcls(16));
	}

	function multiplyTo(a, b, o) {

		// rewrite of the core multiplication to have far less statements (16 instead of 240)
		// it has the same number of local variables (16 more a[0-15], 16 less t[16-31])
		// same number of lookups on a[] (=16)

		var v, c, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15,
		a0 = a[0], a1 = a[1], a2 = a[2],   a3 = a[3], 	a4 = a[4],   a5 = a[5],   a6 = a[6],   a7 = a[7],
		a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11], a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15],
		b0 = b[0], b1 = b[1], b2 = b[2],   b3 = b[3], 	b4 = b[4],   b5 = b[5],   b6 = b[6],   b7 = b[7],
		b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

		t0 = a0*b0+38*(a1*b15+a10*b6+a11*b5+a12*b4+a13*b3+a14*b2+a15*b1+a2*b14+a3*b13+a4*b12+a5*b11+a6*b10+a7*b9+a8*b8+a9*b7);
		t1 = a0*b1+a1*b0+38*(a10*b7+a11*b6+a12*b5+a13*b4+a14*b3+a15*b2+a2*b15+a3*b14+a4*b13+a5*b12+a6*b11+a7*b10+a8*b9+a9*b8);
		t2 = a0*b2+a1*b1+a2*b0+38*(a10*b8+a11*b7+a12*b6+a13*b5+a14*b4+a15*b3+a3*b15+a4*b14+a5*b13+a6*b12+a7*b11+a8*b10+a9*b9);
		t3 = a0*b3+a1*b2+a2*b1+a3*b0+38*(a10*b9+a11*b8+a12*b7+a13*b6+a14*b5+a15*b4+a4*b15+a5*b14+a6*b13+a7*b12+a8*b11+a9*b10);
		t4 = a0*b4+a1*b3+a2*b2+a3*b1+a4*b0+38*(a10*b10+a11*b9+a12*b8+a13*b7+a14*b6+a15*b5+a5*b15+a6*b14+a7*b13+a8*b12+a9*b11);
		t5 = a0*b5+a1*b4+a2*b3+a3*b2+a4*b1+a5*b0+38*(a10*b11+a11*b10+a12*b9+a13*b8+a14*b7+a15*b6+a6*b15+a7*b14+a8*b13+a9*b12);
		t6 = a0*b6+a1*b5+a2*b4+a3*b3+a4*b2+a5*b1+a6*b0+38*(a10*b12+a11*b11+a12*b10+a13*b9+a14*b8+a15*b7+a7*b15+a8*b14+a9*b13);
		t7 = a0*b7+a1*b6+a2*b5+a3*b4+a4*b3+a5*b2+a6*b1+a7*b0+38*(a10*b13+a11*b12+a12*b11+a13*b10+a14*b9+a15*b8+a8*b15+a9*b14);
		t8 = a0*b8+a1*b7+a2*b6+a3*b5+a4*b4+a5*b3+a6*b2+a7*b1+a8*b0+38*(a10*b14+a11*b13+a12*b12+a13*b11+a14*b10+a15*b9+a9*b15);
		t9 = a0*b9+a1*b8+a2*b7+a3*b6+a4*b5+a5*b4+a6*b3+a7*b2+a8*b1+a9*b0+38*(a10*b15+a11*b14+a12*b13+a13*b12+a14*b11+a15*b10);
		t10 = a0*b10+a1*b9+a10*b0+a2*b8+a3*b7+a4*b6+a5*b5+a6*b4+a7*b3+a8*b2+a9*b1+38*(a11*b15+a12*b14+a13*b13+a14*b12+a15*b11);
		t11 = a0*b11+a1*b10+a10*b1+a11*b0+a2*b9+a3*b8+a4*b7+a5*b6+a6*b5+a7*b4+a8*b3+a9*b2+38*(a12*b15+a13*b14+a14*b13+a15*b12);
		t12 = a0*b12+a1*b11+a10*b2+a11*b1+a12*b0+a2*b10+a3*b9+a4*b8+a5*b7+a6*b6+a7*b5+a8*b4+a9*b3+38*(a13*b15+a14*b14+a15*b13);
		t13 = a0*b13+a1*b12+a10*b3+a11*b2+a12*b1+a13*b0+a2*b11+a3*b10+a4*b9+a5*b8+a6*b7+a7*b6+a8*b5+a9*b4+38*(a14*b15+a15*b14);
		t14 = a0*b14+a1*b13+a10*b4+a11*b3+a12*b2+a13*b1+a14*b0+a2*b12+a3*b11+a4*b10+a5*b9+a6*b8+a7*b7+a8*b6+a9*b5+38*(a15*b15);
		t15 = a0*b15+a1*b14+a10*b5+a11*b4+a12*b3+a13*b2+a14*b1+a15*b0+a2*b13+a3*b12+a4*b11+a5*b10+a6*b9+a7*b8+a8*b7+a9*b6;

		/**
		 * Le math.floor() a été remplacé par un 0 | pour des raisons de performances.
		 * Voir document de pierrick Gaudry - EVOTE_APP_SPEC_CRY_analyseJSMathFloor.pdf
		 */
		
		// first car
		c = 1;
		v =  t0 + c + 65535; c = 0|(v / 65536);  t0 = v - c * 65536;
		v =  t1 + c + 65535; c = 0|(v / 65536);  t1 = v - c * 65536;
		v =  t2 + c + 65535; c = 0|(v / 65536);  t2 = v - c * 65536;
		v =  t3 + c + 65535; c = 0|(v / 65536);  t3 = v - c * 65536;
		v =  t4 + c + 65535; c = 0|(v / 65536);  t4 = v - c * 65536;
		v =  t5 + c + 65535; c = 0|(v / 65536);  t5 = v - c * 65536;
		v =  t6 + c + 65535; c = 0|(v / 65536);  t6 = v - c * 65536;
		v =  t7 + c + 65535; c = 0|(v / 65536);  t7 = v - c * 65536;
		v =  t8 + c + 65535; c = 0|(v / 65536);  t8 = v - c * 65536;
		v =  t9 + c + 65535; c = 0|(v / 65536);  t9 = v - c * 65536;
		v = t10 + c + 65535; c = 0|(v / 65536); t10 = v - c * 65536;
		v = t11 + c + 65535; c = 0|(v / 65536); t11 = v - c * 65536;
		v = t12 + c + 65535; c = 0|(v / 65536); t12 = v - c * 65536;
		v = t13 + c + 65535; c = 0|(v / 65536); t13 = v - c * 65536;
		v = t14 + c + 65535; c = 0|(v / 65536); t14 = v - c * 65536;
		v = t15 + c + 65535; c = 0|(v / 65536); t15 = v - c * 65536;
		t0 += 38 * (c-1);

		// second car
		c = 1;
		v =  t0 + c + 65535; c = 0|(v / 65536);  t0 = v - c * 65536;
		v =  t1 + c + 65535; c = 0|(v / 65536);  t1 = v - c * 65536;
		v =  t2 + c + 65535; c = 0|(v / 65536);  t2 = v - c * 65536;
		v =  t3 + c + 65535; c = 0|(v / 65536);  t3 = v - c * 65536;
		v =  t4 + c + 65535; c = 0|(v / 65536);  t4 = v - c * 65536;
		v =  t5 + c + 65535; c = 0|(v / 65536);  t5 = v - c * 65536;
		v =  t6 + c + 65535; c = 0|(v / 65536);  t6 = v - c * 65536;
		v =  t7 + c + 65535; c = 0|(v / 65536);  t7 = v - c * 65536;
		v =  t8 + c + 65535; c = 0|(v / 65536);  t8 = v - c * 65536;
		v =  t9 + c + 65535; c = 0|(v / 65536);  t9 = v - c * 65536;
		v = t10 + c + 65535; c = 0|(v / 65536); t10 = v - c * 65536;
		v = t11 + c + 65535; c = 0|(v / 65536); t11 = v - c * 65536;
		v = t12 + c + 65535; c = 0|(v / 65536); t12 = v - c * 65536;
		v = t13 + c + 65535; c = 0|(v / 65536); t13 = v - c * 65536;
		v = t14 + c + 65535; c = 0|(v / 65536); t14 = v - c * 65536;
		v = t15 + c + 65535; c = 0|(v / 65536); t15 = v - c * 65536;
		t0 += 38 * (c-1);

		o[ 0] = t0;  o[ 1] = t1;  o[ 2] = t2;  o[ 3] = t3;
		o[ 4] = t4;  o[ 5] = t5;  o[ 6] = t6;  o[ 7] = t7;
		o[ 8] = t8;  o[ 9] = t9;  o[10] = t10; o[11] = t11;
		o[12] = t12; o[13] = t13; o[14] = t14; o[15] = t15;
		return o;
	}
	function multiply(a, b) {
		return multiplyTo(a, b, new numcls(16));
	}

	// Warning: in the original code from inv25519, argument was i and the loop counter was a. Changed for consistency.
	// also removed number allocation for temporary term
	function invertTo(a, o) {
		for (var i = 0; i < 16; i++) o[i] = a[i];
		for (var i = 253; i >= 0; i--) {
			squareTo(o, o);
			if(i !== 2 && i !== 4)
				multiplyTo(o, a, o);
		}
		return o;
	}
	function invert(a) {
		return invertTo(a, new numcls(16));
	}
	// END OF NACL-FAST LOOTING

	function negateTo(a, o) {
		for (var i = 0; i < 16; i++)
			o[i] = -a[i];
		return o;
	}
	function negate(a) {
		return negateTo(a, new numcls(16));
	}

	function divideTo(a, b, o) {
		// 1. If b = 0, error
		var isZero = true;
		for (var i = 0; i < 16; i++)
			if (b[i] != 0) {
				isZero = false;
				break;
			}
		if (isZero)
			throw new Error("Dividing by Zero is bad");

		// 2. Multiply by inverse
		return multiplyTo(a, invert(b), o);
	}
	function divide(a, b) {
		return divideTo(a, b, new numcls(16));
	}

	function equal(a, b) {
		reduce25519(a);
		reduce25519(b);
		for (var i = 0; i < 16; i++)
			if (a[i] != b[i])
				return false;
		return true;
	}

	// check that all values are zero
	function isOne(a) {
		for (var i = 15; i > 0; i--)
			if (a[i] != 0)
				return false;
		if (a[0] != 1)
			return false;
		return true;
	}

	this.A = add;
	this.Z = subtract;
	this.N = negate;
	this.M = multiply;
	this.S = square;
	this.I = invert;
	this.D = divide;
	this.E = equal;
	this.isOne = isOne;

	this.A2 = addTo;
	this.Z2 = subtractTo;
	this.N2 = negateTo;
	this.M2 = multiplyTo;
	this.S2 = squareTo;
	this.I2 = invertTo;
	this.D2 = divideTo;

	this.baseclass = numcls;
}

var fp = new FPfast();
