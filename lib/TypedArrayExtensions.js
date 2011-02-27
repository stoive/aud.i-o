var typedArrays = [Float32Array];

// lifted from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map and etc
var mapFactory = function(Type) {
	return function(fun /*, thisp */) {
		"use strict";

		if (this === void 0 || this === null)
		  throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function")
		  throw new TypeError();

		var res = new Type(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t)
				res[i] = fun.call(thisp, t[i], i, t);
		}

		return res;
	};
};

var forEach = function(fun /*, thisp */) {
	"use strict";

	if (this === void 0 || this === null)
		throw new TypeError();

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	var thisp = arguments[1];
	for (var i = 0; i < len; i++) {
		if (i in t) fun.call(thisp, t[i], i, t);
	}
};

var reduce = function(fun /*, initialValue */) {
	"use strict";
	
	if (this === void 0 || this === null)
		throw new TypeError();

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== "function")
		throw new TypeError();

	// no value to return if no initial value and an empty array
	if (len == 0 && arguments.length == 1)
		throw new TypeError();

	var k = 0;
	var accumulator;
	if (arguments.length >= 2) {
		accumulator = arguments[1];
	}
	else {
		do {
			if (k in t)	{
				accumulator = t[k++];
				break;
			}

			// if array contains no values, no initial value to return
			if (++k >= len)
				throw new TypeError();
	  	}
		while (true);
	}

	while (k < len) {
		if (k in t)
			accumulator = fun.call(undefined, accumulator, t[k], k, t);
		k++;
	}

	return accumulator;
};

var toArray = function() {
	var out = [];
	this.forEach(function (curr) {
		out.push(curr);
	});
	return out;
}

for (var i in typedArrays) {
	if (typedArrays[i]) {
		typedArrays[i].prototype.map = mapFactory(typedArrays[i]);
		typedArrays[i].prototype.reduce = reduce;
		typedArrays[i].prototype.forEach = forEach;
		typedArrays[i].prototype.toArray = toArray;
	}
}

// An early attempt to polyfill TypedArrays
if (!Float32Array) {
	var Float32Array = Object(Array);
}

Array.prototype.__defineProperty__("toArray", {
	value: toArray,
	writable: true,
	configurable: true,
	enumerable: false
});
