/*

Copyright (c) 2011, Steven Thurlow
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Steven Thurlow nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var typedArrays = [Float32Array, Uint8Array];

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

for (var i in typedArrays) {
	if (typedArrays[i]) {
		typedArrays[i].prototype.map = mapFactory(typedArrays[i]);
		typedArrays[i].prototype.reduce = reduce;
		typedArrays[i].prototype.forEach = forEach;
	}
}

ArrayBuffer.prototype.toString = function() {
	var arr = new Uint8Array(this);
	var out = new Array(arr.length);
	arr.forEach(function(curr, i) {
		 out[i] = String.fromCharCode(curr);
	});
	return out.join("");
}
