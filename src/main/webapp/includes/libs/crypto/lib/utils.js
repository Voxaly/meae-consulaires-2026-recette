
// define globals if we're in a browser
if (typeof window !== "undefined") {
	var BigInteger = jsbn.BigInteger;
	var SecureRandom = jsbn.SecureRandom;
	// make serialization of BigInts an HEX string
	BigInteger.prototype.toJSON = function() {
		// return btoa(hex2bin(this.toString(16)));
		// return this.toString(16);
		return this.toString(36);
	};
	BigInteger.ZERO.name = 'Zero';
	BigInteger.ONE.name = 'One';
}

// ensure that both are "false" on Prod
var USE_FAKE_RANDOM = false;
var SHOW_TRACES = false;

// init tracer
var tracer = null;
var trace_clear = null;
var trace_remove = null;
(function() {
	function $(id) {
		var it = window[id];
		if(it) {
			var type = typeof it;
			if(type == 'object') {
				var str = it.toString();
				if(str != '[object Window]')
					return it;
			}
		}
		return document.getElementById(id);
	}

	var trace_txt = '';
	trace_clear = function() { trace_txt = ''; $('trace_text').value = trace_txt; }
	trace_remove = function() { document.body.removeChild($('trace')); }
	function trace(text) {
		var elem = $('trace');
		if(elem == null) {
			var newelem = document.createElement('div');
			newelem.id = 'trace';
			document.body.appendChild(newelem);
			newelem.innerHTML = '<input onclick="trace_clear()" type="button" value="Clear"><input onclick="trace_remove()" type="button" value="Remove"><br><textarea id="trace_text" cols="120" rows="25" spellcheck="false"></textarea>';
		}
		trace_txt += text + '\n';
		var trace_area = $('trace_text');
		trace_area.value = trace_txt;
		trace_area.scrollTop = trace_area.scrollHeight;			
	}
	var times = {};
	function chronoStart(name) {
		if (!times[name])
			times[name] = new Date().getTime();
	}
	function chronoEnd(name) {
		if (times[name]) {
			var now = new Date().getTime();
			tracer.log("\ttiming for " + name + ": " + (now - times[name]));
		}
	}
	function noop(){}

	if (!SHOW_TRACES) {
		// console.log("Traces: no traces");
		tracer = {
			log: noop,
			warn: noop,
			time: noop,
			timeEnd: noop
		};
	} else if (typeof document == 'object' && typeof console != 'object') {
		// console.log("Traces: browser with no console");
		tracer = {
			log: function(txt) { trace(txt); },
			warn: function(txt) { trace(txt); },
			time: chronoStart,
			timeEnd: chronoEnd
		};
	} else {
		// console.log("Traces: no browser or browser with console");
		// if we're not in a browser, redirect to console
		// if console.time doesn't exist (nashorn), use our own implementation
		tracer = {
			log: function(txt) { console.log(txt); },
			warn: function(txt) { console.warn(txt); },
			time: chronoStart,
			timeEnd: chronoEnd
		};
	}
})();

// Wrapper for SHA generation
// typical call: 	var sha = SHA.create("SHA-256", "TEXT", "HEX").hash("This is a test");
var SHA = {
	// input can be HEX, B64, BYTES, ARRAYBUFFER or TEXT
	// output can be HEX, B64, BYTES or ARRAYBUFFER
	create: function(type, input, output){
		if (type != "SHA-256")
			throw "Only SHA-256 is supported";
		var shaobj = new jsSHA(type, input);
		var outputformat = output;
		return {
			hash: function(data) {
				shaobj.update(data);
				return shaobj.getHash(outputformat);
			}
		};
	}
};

//-------------------------- RandomizeUtils ----------------------------------------------
// !!! TODO: remove the whole concept of fake random
/** @this {RandomizeUtils} */
function RandomizeUtils() {

	// this is JSBN random.
	// BigInteger use it by calling "nextBytes" with an array to fill with random byte values
	this._rnd = new SecureRandom();

	this._strongCrypto = (typeof window !== "undefined" && (window.crypto || window.msCrypto)) ? true : false;
	// console.log("Strong crypto: " + this._strongCrypto);
	this._xorPool = null;
	this._poolIndex = 0;
	this.setRandomPool = function(pool) {
		if (pool)
			this._xorPool = pool.map(function(str){ return new BigInteger(str, 16); });
	}

	// Returns a random BigInteger between 0 et b
	this.randomize_real = function(max, randsource) {
		var maxB = typeof max == "number" ? new BigInteger('' + max) : max;
		var rnd = randsource || this._rnd;
		var k = maxB.subtract(BigInteger.ONE).bitLength();
		// pick a xor value from the pool if needed and available
		var xor = BigInteger.ZERO;
		if (!this._strongCrypto && this._xorPool && this._xorPool.length > 0)
			xor = this._xorPool[(this._poolIndex++) % this._xorPool.length].mod(max);
		var r;
		do {
			// BigInteger random number generation constructor takes (bit number, random generator)
			r = new BigInteger(k, rnd);
			r = r.xor(xor);
			// we have a random number with the right bit number, but may still be > max, so retry if it happens
		} while (r.compareTo(maxB) >= 0 || r.equals(BigInteger.ZERO));
		// ensuring that output is not zero gets us real (not null) proofs
		// tracer.log("randomize_real: max=" + max.toString() + " => " + r.toString());
		return r;
	};

	// this.randomize_fake = function(b, rnd) {
	// 	return new BigInteger("c318ba4e9bf89be87b1df6348e2088d03cac88de60db6441fb2e6badd355778", 16);
	// };

	// random is always forced to fake if we're not in a browser
	// this.randomize = (USE_FAKE_RANDOM || typeof window == "undefined") ? this.randomize_fake : this.randomize_real;
	this.randomize = this.randomize_real;
}
var randomizeUtils = new RandomizeUtils();

//-------------------------- OO tools shim ----------------------------------------------
function createObject(proto) {
	function ctor() { }
	ctor.prototype = proto;
	return new ctor();
}

function extend(base, sub) {
	// Avoid instantiating the base class just to setup inheritance
	// Also, do a recursive merge of two prototypes, so we don't overwrite the existing prototype, but still maintain the inheritance chain
	var origProto = sub.prototype;
	sub.prototype = createObject(base.prototype);
	for (var key in origProto)
		sub.prototype[key] = origProto[key];

	// The constructor property was set wrong, let's fix it
	// Not possible on IE7-8, so never mind, constructor will be enumerable
	// Object.defineProperty(sub.prototype, 'constructor', { enumerable: false, value: sub });
}
