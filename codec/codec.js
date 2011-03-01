/*

Copyright (c) 2011, Steven Thurlow
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of aud.i-o nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var DataFrame = function(samples, seeds) {
	this.samples = samples;
	this.seeds = seeds || [];
}
DataFrame.prototype = {
	samples: [],
	seeds: [],
	range: 0.0
};
DataFrame.prototype.constructor = DataFrame;

function nthOrderError(i, arr, order, seeds) {
	if (order > 0) {
		return nthOrderError(i, arr, order-1, seeds) - nthOrderError(i-1, arr, order-1, seeds);
	}
	else {
		if (i >= 0) return arr[i];
		else return (seeds[seeds.length + i] || 0);
	}
}

function nthOrderPrediction(i, arr, order, seeds) {
	function val(i) { return (arr[i] || seeds[seeds.length + i] || 0); }
	if (order == 0)
		return 0;
	if (order == 1)
		return val(i-1);
	if (order == 2)
		return 2*val(i-1) - val(i-2);
	if (order == 3)
		return 3*val(i-1) - 3*val(i-2) + val(i-3);
}

function encodeNth(input, order, seeds) {
	seeds = seeds || [];
	return new DataFrame(
		input.map(
			function(curr, i, out) {
				return nthOrderError(i, out, order, seeds);
			}),
		seeds);
};

function decodeNth(dataFrame, order) {
	var output = new Float32Array(dataFrame.samples.length);
	dataFrame.samples.map(
		function(curr,i,input) { 
			return (output[i] = nthOrderPrediction(i, output, order, dataFrame.seeds) + curr); 
		});
	return output;
};

// linear adaptive quantization
function quantizeLin(dataFrame, bits) {
	bits = bits || 4;
	var err = 0;
	//dataFrame.range = 0.125;
	dataFrame.range = Math.max.apply(Math, Array.prototype.slice.call(dataFrame.samples));
	var steps = Math.pow(bits, 2) / 2;
	var stepSize = dataFrame.range / steps;
	dataFrame.samples = dataFrame.samples.map(function(curr, i, out) {
		var val = (curr + err) / stepSize;
		if (val >= 0) val = Math.round(val >= steps ? steps - 1 : val);
		else val = Math.round(val < -steps ? -steps : val);

		err = curr + err - val * stepSize;
		return val;
	});
}

function unQuantizeLin(dataFrame, bits) {
	var steps = Math.pow(bits, 2) / 2;
	var stepSize = dataFrame.range / steps;
	dataFrame.samples = dataFrame.samples.map(function(curr, i, out) {
		return curr * stepSize;
	});
}

function quantizeLog(input, levels, range) {

}
