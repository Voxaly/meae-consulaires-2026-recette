
/* Alternate storage for Fp numbers: object with 16 fields a0? instead of a 16-elements array
 * 
 * all loops are unwinded. This gives about 3% perf globally.
*/

function fpnum() {
	this.a00 = 0;
	this.a01 = 0;
	this.a02 = 0;
	this.a03 = 0;
	this.a04 = 0;
	this.a05 = 0;
	this.a06 = 0;
	this.a07 = 0;
	this.a08 = 0;
	this.a09 = 0;
	this.a10 = 0;
	this.a11 = 0;
	this.a12 = 0;
	this.a13 = 0;
	this.a14 = 0;
	this.a15 = 0;
}

function FPfast() {
	// taken from nacl-fast: car25519, sel25519, packTo25519, A, Z, M, S, I
	this.ZERO = new fpnum();
	this.ONE = new fpnum();
	this.ONE.a00 += 1;
	this.TWO = new fpnum();
	this.TWO.a00 += 2;

	this.check = function(a) {
		// 1. Check if all slices do not flow out of 16 bits
		if (a.a00 >= 65536 || a.a01 >= 65536 || a.a02 >= 65536 || a.a03 >= 65536
		 || a.a04 >= 65536 || a.a05 >= 65536 || a.a06 >= 65536 || a.a07 >= 65536
		 || a.a08 >= 65536 || a.a09 >= 65536 || a.a10 >= 65536 || a.a11 >= 65536
		 || a.a12 >= 65536 || a.a13 >= 65536 || a.a14 >= 65536 || a.a15 >= 65536)
			return false;
		// 2-3-4 just check that we're < P  (=2^255-19)
		// 2. if a[15] < a^15-1, already ok
		if (a.a15 < 32767)
			return true;
		// 3. if any [1-14] slice is not 0xffff, it's ok
		// 4. if last slice is < 65517, it ok
		if (a.a01 !== 65536 || a.a02 !== 65536 || a.a03 !== 65536 || a.a04 !== 65536
		 || a.a05 !== 65536 || a.a06 !== 65536 || a.a07 !== 65536 || a.a08 !== 65536
		 || a.a09 !== 65536 || a.a10 !== 65536 || a.a11 !== 65536 || a.a12 !== 65536
		 || a.a13 !== 65536 || a.a14 !== 65536 || a.a00 < 65517)
			return true;
		return false;
	};

	function car25519(o) {
		var v, c = 1;
		v = o.a00 + c + 65535; c = 0|(v / 65536); o.a00 = v - c * 65536;
		v = o.a01 + c + 65535; c = 0|(v / 65536); o.a01 = v - c * 65536;
		v = o.a02 + c + 65535; c = 0|(v / 65536); o.a02 = v - c * 65536;
		v = o.a03 + c + 65535; c = 0|(v / 65536); o.a03 = v - c * 65536;
		v = o.a04 + c + 65535; c = 0|(v / 65536); o.a04 = v - c * 65536;
		v = o.a05 + c + 65535; c = 0|(v / 65536); o.a05 = v - c * 65536;
		v = o.a06 + c + 65535; c = 0|(v / 65536); o.a06 = v - c * 65536;
		v = o.a07 + c + 65535; c = 0|(v / 65536); o.a07 = v - c * 65536;
		v = o.a08 + c + 65535; c = 0|(v / 65536); o.a08 = v - c * 65536;
		v = o.a09 + c + 65535; c = 0|(v / 65536); o.a09 = v - c * 65536;
		v = o.a10 + c + 65535; c = 0|(v / 65536); o.a10 = v - c * 65536;
		v = o.a11 + c + 65535; c = 0|(v / 65536); o.a11 = v - c * 65536;
		v = o.a12 + c + 65535; c = 0|(v / 65536); o.a12 = v - c * 65536;
		v = o.a13 + c + 65535; c = 0|(v / 65536); o.a13 = v - c * 65536;
		v = o.a14 + c + 65535; c = 0|(v / 65536); o.a14 = v - c * 65536;
		v = o.a15 + c + 65535; c = 0|(v / 65536); o.a15 = v - c * 65536;
		o.a00 += 38 * (c-1);
	}

	// this is the pack25519 function, modified to output into a given number, not a byte array
	function reduce25519(n) {
		car25519(n);
		car25519(n);
		car25519(n);
		var b, t, c, m = new fpnum();
		for (var j = 0; j < 2; j++) {
			m.a00 = n.a00 - 0xffed;
			m.a01 = n.a01 - 0xffff - ((m.a00>>16) & 1); m.a00 &= 0xffff;
			m.a02 = n.a02 - 0xffff - ((m.a01>>16) & 1); m.a01 &= 0xffff;
			m.a03 = n.a03 - 0xffff - ((m.a02>>16) & 1); m.a02 &= 0xffff;
			m.a04 = n.a04 - 0xffff - ((m.a03>>16) & 1); m.a03 &= 0xffff;
			m.a05 = n.a05 - 0xffff - ((m.a04>>16) & 1); m.a04 &= 0xffff;
			m.a06 = n.a06 - 0xffff - ((m.a05>>16) & 1); m.a05 &= 0xffff;
			m.a07 = n.a07 - 0xffff - ((m.a06>>16) & 1); m.a06 &= 0xffff;
			m.a08 = n.a08 - 0xffff - ((m.a07>>16) & 1); m.a07 &= 0xffff;
			m.a09 = n.a09 - 0xffff - ((m.a08>>16) & 1); m.a08 &= 0xffff;
			m.a10 = n.a10 - 0xffff - ((m.a09>>16) & 1); m.a09 &= 0xffff;
			m.a11 = n.a11 - 0xffff - ((m.a10>>16) & 1); m.a10 &= 0xffff;
			m.a12 = n.a12 - 0xffff - ((m.a11>>16) & 1); m.a11 &= 0xffff;
			m.a13 = n.a13 - 0xffff - ((m.a12>>16) & 1); m.a12 &= 0xffff;
			m.a14 = n.a14 - 0xffff - ((m.a13>>16) & 1); m.a13 &= 0xffff;
			m.a15 = n.a15 - 0x7fff - ((m.a14>>16) & 1);
			b = (m.a15>>16) & 1;
			m.a14 &= 0xffff;

			c = ~(-b);
			t = c & (n.a00 ^ m.a00); n.a00 ^= t; m.a00 ^= t;
			t = c & (n.a01 ^ m.a01); n.a01 ^= t; m.a01 ^= t;
			t = c & (n.a02 ^ m.a02); n.a02 ^= t; m.a02 ^= t;
			t = c & (n.a03 ^ m.a03); n.a03 ^= t; m.a03 ^= t;
			t = c & (n.a04 ^ m.a04); n.a04 ^= t; m.a04 ^= t;
			t = c & (n.a05 ^ m.a05); n.a05 ^= t; m.a05 ^= t;
			t = c & (n.a06 ^ m.a06); n.a06 ^= t; m.a06 ^= t;
			t = c & (n.a07 ^ m.a07); n.a07 ^= t; m.a07 ^= t;
			t = c & (n.a08 ^ m.a08); n.a08 ^= t; m.a08 ^= t;
			t = c & (n.a09 ^ m.a09); n.a09 ^= t; m.a09 ^= t;
			t = c & (n.a10 ^ m.a10); n.a10 ^= t; m.a10 ^= t;
			t = c & (n.a11 ^ m.a11); n.a11 ^= t; m.a11 ^= t;
			t = c & (n.a12 ^ m.a12); n.a12 ^= t; m.a12 ^= t;
			t = c & (n.a13 ^ m.a13); n.a13 ^= t; m.a13 ^= t;
			t = c & (n.a14 ^ m.a14); n.a14 ^= t; m.a14 ^= t;
			t = c & (n.a15 ^ m.a15); n.a15 ^= t; m.a15 ^= t;
		}
	}

	this.toHexString = function(a, noreduction) {
		var str = '';
		if (!noreduction)
			reduce25519(a);
		var b;
		b = '000' + a.a15.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a14.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a13.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a12.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a11.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a10.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a09.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a08.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a07.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a06.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a05.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a04.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a03.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a02.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a01.toString(16); str += b.substr(b.length-4);
		b = '000' + a.a00.toString(16); str += b.substr(b.length-4);
		return str;
	};
	// probably costly, but we only do it for proof generation
	this.toStringBase = function(a, radix) {
		var s = this.toHexString(a);
		if (radix !== 16)
			s = (new BigInteger(s, 16)).toString(radix);
		return s;
	};

	this.showInternal = function(a) {
		return '[' + a.reverse().map(function(n){ return n.toString(16); }).join('-') + ']';
	};

	this.fromHexString = function(str, radix, nocheck) {
		var rdx = radix || 16;
		// convert to base 16 if not already
		var str1 = rdx === 16 ? str : (new BigInteger(str, radix)).toString(16);
		var str2 = '0000000000000000000000000000000000000000000000000000000000000000' + str1;
		str2 = str2.substr(str2.length - 64);
		var o = new fpnum();
		o.a15 = parseInt(str2.substr(0, 4), 16);
		o.a14 = parseInt(str2.substr(4, 4), 16);
		o.a13 = parseInt(str2.substr(8, 4), 16);
		o.a12 = parseInt(str2.substr(12, 4), 16);
		o.a11 = parseInt(str2.substr(16, 4), 16);
		o.a10 = parseInt(str2.substr(20, 4), 16);
		o.a09 = parseInt(str2.substr(24, 4), 16);
		o.a08 = parseInt(str2.substr(28, 4), 16);
		o.a07 = parseInt(str2.substr(32, 4), 16);
		o.a06 = parseInt(str2.substr(36, 4), 16);
		o.a05 = parseInt(str2.substr(40, 4), 16);
		o.a04 = parseInt(str2.substr(44, 4), 16);
		o.a03 = parseInt(str2.substr(48, 4), 16);
		o.a02 = parseInt(str2.substr(52, 4), 16);
		o.a01 = parseInt(str2.substr(56, 4), 16);
		o.a00 = parseInt(str2.substr(60, 4), 16);

		// tracer.log(this.showInternal(o));
		if (!nocheck && !this.check(o))
			throw new Error("This number is to large: " + str);
		return o;
	};
	this.d = this.fromHexString("52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3");
	// p is only used for external reference, we never use it directly. It is hardcoded in the functions whenever useful (eg: check)
	this.p = this.fromHexString("7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed", null, true);

	function addTo(a, b, o) {
		o.a00 = a.a00 + b.a00;
		o.a01 = a.a01 + b.a01;
		o.a02 = a.a02 + b.a02;
		o.a03 = a.a03 + b.a03;
		o.a04 = a.a04 + b.a04;
		o.a05 = a.a05 + b.a05;
		o.a06 = a.a06 + b.a06;
		o.a07 = a.a07 + b.a07;
		o.a08 = a.a08 + b.a08;
		o.a09 = a.a09 + b.a09;
		o.a10 = a.a10 + b.a10;
		o.a11 = a.a11 + b.a11;
		o.a12 = a.a12 + b.a12;
		o.a13 = a.a13 + b.a13;
		o.a14 = a.a14 + b.a14;
		o.a15 = a.a15 + b.a15;
		return o;
	}
	function add(a, b) {
		return addTo(a, b, new fpnum());
	}

	function subtractTo(a, b, o) {
		o.a00 = a.a00 - b.a00;
		o.a01 = a.a01 - b.a01;
		o.a02 = a.a02 - b.a02;
		o.a03 = a.a03 - b.a03;
		o.a04 = a.a04 - b.a04;
		o.a05 = a.a05 - b.a05;
		o.a06 = a.a06 - b.a06;
		o.a07 = a.a07 - b.a07;
		o.a08 = a.a08 - b.a08;
		o.a09 = a.a09 - b.a09;
		o.a10 = a.a10 - b.a10;
		o.a11 = a.a11 - b.a11;
		o.a12 = a.a12 - b.a12;
		o.a13 = a.a13 - b.a13;
		o.a14 = a.a14 - b.a14;
		o.a15 = a.a15 - b.a15;
		return o;
	}
	function subtract(a, b) {
		return subtractTo(a, b, new fpnum());
	}

	function squareTo(a, o) {
		var v, c, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15,
		a0  = a.a00, a1  = a.a01, a2  = a.a02, a3  = a.a03,
		a4  = a.a04, a5  = a.a05, a6  = a.a06, a7  = a.a07,
		a8  = a.a08, a9  = a.a09, a10 = a.a10, a11 = a.a11,
		a12 = a.a12, a13 = a.a13, a14 = a.a14, a15 = a.a15;

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

		o.a00 = t0;  o.a01 = t1;  o.a02 = t2;  o.a03 = t3;
		o.a04 = t4;  o.a05 = t5;  o.a06 = t6;  o.a07 = t7;
		o.a08 = t8;  o.a09 = t9;  o.a10 = t10; o.a11 = t11;
		o.a12 = t12; o.a13 = t13; o.a14 = t14; o.a15 = t15;
		return o;
	}

	function multiplyTo(a, b, o) {
		var v, c,
		t0 = 0,  t1 = 0,  t2 = 0,  t3 = 0,  t4 = 0,  t5 = 0,  t6 = 0,  t7 = 0,
		t8 = 0,  t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0,
		t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0,
		t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0,

		b0  = b.a00, b1  = b.a01, b2  = b.a02, b3  = b.a03,
		b4  = b.a04, b5  = b.a05, b6  = b.a06, b7  = b.a07,
		b8  = b.a08, b9  = b.a09, b10 = b.a10, b11 = b.a11,
		b12 = b.a12, b13 = b.a13, b14 = b.a14, b15 = b.a15;

		t0 += a0 * b0;   t1 += v * b1;   t2 += v * b2;   t3 += v * b3;
		t4 += a0 * b4;   t5 += v * b5;   t6 += v * b6;   t7 += v * b7;
		t8 += a0 * b8;   t9 += v * b9;   t10 += v * b10; t11 += v * b11;
		t12 += a0 * b12; t13 += v * b13; t14 += v * b14; t15 += v * b15;



		v = a.a01;
		t1 += v * b0;   t2 += v * b1;   t3 += v * b2;   t4 += v * b3;
		t5 += v * b4;   t6 += v * b5;   t7 += v * b6;   t8 += v * b7;
		t9 += v * b8;   t10 += v * b9;  t11 += v * b10; t12 += v * b11;
		t13 += v * b12; t14 += v * b13; t15 += v * b14; t16 += v * b15;
		v = a.a02;
		t2 += v * b0;   t3 += v * b1;   t4 += v * b2;   t5 += v * b3;
		t6 += v * b4;   t7 += v * b5;   t8 += v * b6;   t9 += v * b7;
		t10 += v * b8;  t11 += v * b9;  t12 += v * b10; t13 += v * b11;
		t14 += v * b12; t15 += v * b13; t16 += v * b14; t17 += v * b15;
		v = a.a03;
		t3 += v * b0;   t4 += v * b1;   t5 += v * b2;   t6 += v * b3;
		t7 += v * b4;   t8 += v * b5;   t9 += v * b6;   t10 += v * b7;
		t11 += v * b8;  t12 += v * b9;  t13 += v * b10; t14 += v * b11;
		t15 += v * b12; t16 += v * b13; t17 += v * b14; t18 += v * b15;
		v = a.a04;
		t4 += v * b0;   t5 += v * b1;   t6 += v * b2;   t7 += v * b3;
		t8 += v * b4;   t9 += v * b5;   t10 += v * b6;  t11 += v * b7;
		t12 += v * b8;  t13 += v * b9;  t14 += v * b10; t15 += v * b11;
		t16 += v * b12; t17 += v * b13; t18 += v * b14; t19 += v * b15;
		v = a.a05;
		t5 += v * b0;   t6 += v * b1;   t7 += v * b2;   t8 += v * b3;
		t9 += v * b4;   t10 += v * b5;  t11 += v * b6;  t12 += v * b7;
		t13 += v * b8;  t14 += v * b9;  t15 += v * b10; t16 += v * b11;
		t17 += v * b12; t18 += v * b13; t19 += v * b14; t20 += v * b15;
		v = a.a06;
		t6 += v * b0;   t7 += v * b1;   t8 += v * b2;   t9 += v * b3;
		t10 += v * b4;  t11 += v * b5;  t12 += v * b6;  t13 += v * b7;
		t14 += v * b8;  t15 += v * b9;  t16 += v * b10;  t17 += v * b11;
		t18 += v * b12; t19 += v * b13; t20 += v * b14; t21 += v * b15;
		v = a.a07;
		t7 += v * b0;   t8 += v * b1;   t9 += v * b2;   t10 += v * b3;
		t11 += v * b4;  t12 += v * b5;  t13 += v * b6;  t14 += v * b7;
		t15 += v * b8;  t16 += v * b9;  t17 += v * b10; t18 += v * b11;
		t19 += v * b12; t20 += v * b13; t21 += v * b14; t22 += v * b15;
		v = a.a08;
		t8 += v * b0;   t9 += v * b1;   t10 += v * b2;  t11 += v * b3;
		t12 += v * b4;  t13 += v * b5;  t14 += v * b6;  t15 += v * b7;
		t16 += v * b8;  t17 += v * b9;  t18 += v * b10; t19 += v * b11;
		t20 += v * b12; t21 += v * b13; t22 += v * b14; t23 += v * b15;
		v = a.a09;
		t9 += v * b0;   t10 += v * b1;  t11 += v * b2;  t12 += v * b3;
		t13 += v * b4;  t14 += v * b5;  t15 += v * b6;  t16 += v * b7;
		t17 += v * b8;  t18 += v * b9;  t19 += v * b10; t20 += v * b11;
		t21 += v * b12; t22 += v * b13; t23 += v * b14; t24 += v * b15;
		v = a.a10;
		t10 += v * b0;  t11 += v * b1;  t12 += v * b2;  t13 += v * b3;
		t14 += v * b4;  t15 += v * b5;  t16 += v * b6;  t17 += v * b7;
		t18 += v * b8;  t19 += v * b9;  t20 += v * b10; t21 += v * b11;
		t22 += v * b12; t23 += v * b13; t24 += v * b14; t25 += v * b15;
		v = a.a11;
		t11 += v * b0;  t12 += v * b1;  t13 += v * b2;  t14 += v * b3;
		t15 += v * b4;  t16 += v * b5;  t17 += v * b6;  t18 += v * b7;
		t19 += v * b8;  t20 += v * b9;  t21 += v * b10; t22 += v * b11;
		t23 += v * b12; t24 += v * b13; t25 += v * b14; t26 += v * b15;
		v = a.a12;
		t12 += v * b0;  t13 += v * b1;  t14 += v * b2;  t15 += v * b3;
		t16 += v * b4;  t17 += v * b5;  t18 += v * b6;  t19 += v * b7;
		t20 += v * b8;  t21 += v * b9;  t22 += v * b10; t23 += v * b11;
		t24 += v * b12; t25 += v * b13; t26 += v * b14; t27 += v * b15;
		v = a.a13;
		t13 += v * b0;  t14 += v * b1;  t15 += v * b2;  t16 += v * b3;
		t17 += v * b4;  t18 += v * b5;  t19 += v * b6;  t20 += v * b7;
		t21 += v * b8;  t22 += v * b9;  t23 += v * b10; t24 += v * b11;
		t25 += v * b12; t26 += v * b13; t27 += v * b14; t28 += v * b15;
		v = a.a14;
		t14 += v * b0;  t15 += v * b1;  t16 += v * b2;  t17 += v * b3;
		t18 += v * b4;  t19 += v * b5;  t20 += v * b6;  t21 += v * b7;
		t22 += v * b8;  t23 += v * b9;  t24 += v * b10; t25 += v * b11;
		t26 += v * b12; t27 += v * b13; t28 += v * b14; t29 += v * b15;
		v = a.a15;
		t15 += v * b0;  t16 += v * b1;  t17 += v * b2;  t18 += v * b3;
		t19 += v * b4;  t20 += v * b5;  t21 += v * b6;  t22 += v * b7;
		t23 += v * b8;  t24 += v * b9;  t25 += v * b10; t26 += v * b11;
		t27 += v * b12; t28 += v * b13; t29 += v * b14; t30 += v * b15;

		t0  += 38 * t16; t1  += 38 * t17; t2  += 38 * t18; t3  += 38 * t19;
		t4  += 38 * t20; t5  += 38 * t21; t6  += 38 * t22; t7  += 38 * t23;
		t8  += 38 * t24; t9  += 38 * t25; t10 += 38 * t26; t11 += 38 * t27;
		t12 += 38 * t28; t13 += 38 * t29; t14 += 38 * t30; // t15 left as is

		// car:
		// var i, v, c = 1;
		// for (i = 0; i < 16; i++) {
		// 	v = o[i] + c + 65535;
		// 	c = Math.floor(v / 65536);
		// 	o[i] = v - c * 65536;
		// }
		// o[0] += c-1 + 37 * (c-1);

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

		o.a00 = t0;  o.a01 = t1;  o.a02 = t2;  o.a03 = t3;
		o.a04 = t4;  o.a05 = t5;  o.a06 = t6;  o.a07 = t7;
		o.a08 = t8;  o.a09 = t9;  o.a10 = t10; o.a11 = t11;
		o.a12 = t12; o.a13 = t13; o.a14 = t14; o.a15 = t15;
		return o;
	}
	// accepts multiple factors
	function multiply(a, b) {
		return multiplyTo(a, b, new fpnum());
	}

	function squareTo(a, o) {
		return multiplyTo(a, a, o);
	}
	function square(a) {
		return multiplyTo(a, a, new fpnum());
	}

	// Warning: in the original code from inv25519, argument was i and the loop counter was a. Changed for consistency.
	// also removed number allocation for temporary term
	function invertTo(a, o) {
		o.a00 = a.a00;
		o.a01 = a.a01;
		o.a02 = a.a02;
		o.a03 = a.a03;
		o.a04 = a.a04;
		o.a05 = a.a05;
		o.a06 = a.a06;
		o.a07 = a.a07;
		o.a08 = a.a08;
		o.a09 = a.a09;
		o.a10 = a.a10;
		o.a11 = a.a11;
		o.a12 = a.a12;
		o.a13 = a.a13;
		o.a14 = a.a14;
		o.a15 = a.a15;
		for (var i = 253; i >= 0; i--) {
			squareTo(o, o);
			if(i !== 2 && i !== 4)
				multiplyTo(o, a, o);
		}
		return o;
	}
	function invert(a) {
		return invertTo(a, new fpnum());
	}
	// END OF NACL-FAST LOOTING

	function negateTo(a, o) {
		o.a00 = -a.a00;
		o.a01 = -a.a01;
		o.a02 = -a.a02;
		o.a03 = -a.a03;
		o.a04 = -a.a04;
		o.a05 = -a.a05;
		o.a06 = -a.a06;
		o.a07 = -a.a07;
		o.a08 = -a.a08;
		o.a09 = -a.a09;
		o.a10 = -a.a10;
		o.a11 = -a.a11;
		o.a12 = -a.a12;
		o.a13 = -a.a13;
		o.a14 = -a.a14;
		o.a15 = -a.a15;
		return o;
	}
	function negate(a) {
		return negateTo(a, new fpnum());
	}

	function divideTo(a, b, o) {
		// 1. If b = 0, error
		if (a.a00 === 0 && a.a01 === 0 && a.a02 === 0 && a.a03 === 0
		 && a.a04 === 0 && a.a05 === 0 && a.a06 === 0 && a.a07 === 0
		 && a.a08 === 0 && a.a09 === 0 && a.a10 === 0 && a.a11 === 0
		 && a.a12 === 0 && a.a13 === 0 && a.a14 === 0 && a.a15 === 0)
			throw new Error("Dividing by Zero is bad");

		// 2. Multiply by inverse
		return multiplyTo(a, invert(b), o);
	}
	function divide(a, b) {
		return divideTo(a, b, new fpnum());
	}

	function equal(a, b) {
		reduce25519(a);
		reduce25519(b);
		return (a.a00 === b.a00 && a.a01 === b.a01 && a.a02 === b.a02 && a.a03 === b.a03
			 && a.a04 === b.a04 && a.a05 === b.a05 && a.a06 === b.a06 && a.a07 === b.a07
			 && a.a08 === b.a08 && a.a09 === b.a09 && a.a10 === b.a10 && a.a11 === b.a11
			 && a.a12 === b.a12 && a.a13 === b.a13 && a.a14 === b.a14 && a.a15 === b.a15);
	}

	// check that all values are zero
	function isOne(a) {
		return (a.a00 === 1 && a.a01 === 0 && a.a02 === 0 && a.a03 === 0
			 && a.a04 === 0 && a.a05 === 0 && a.a06 === 0 && a.a07 === 0
			 && a.a08 === 0 && a.a09 === 0 && a.a10 === 0 && a.a11 === 0
			 && a.a12 === 0 && a.a13 === 0 && a.a14 === 0 && a.a15 === 0);
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
}

var fp = new FPfast();
