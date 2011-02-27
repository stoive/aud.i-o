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
	var output = [];
	dataFrame.samples.map(
		function(curr,i,input) { 
			return (output[i] = nthOrderPrediction(i, output, order, dataFrame.seeds) + curr); 
		});
	return output;
};

// linear adaptive quantization
function quantizeLin(dataFrame, steps) {
	steps = steps || 4;
	var err = 0;
	//dataFrame.range = 0.125;
	dataFrame.range = Math.max.apply(Math, dataFrame.samples);
	var step = dataFrame.range / steps;
	dataFrame.samples = dataFrame.samples.map(function(curr, i, out) {
		var val = (curr + err) / step;
		if (val >= 0) val = Math.round(val >= steps ? steps - 1 : val);
		else val = Math.round(val < -steps ? -steps : val);

		err = curr + err - val * step;
		return val;
	});
}

function unQuantizeLin(dataFrame, steps) {
	var stepSize = dataFrame.range / steps;
	dataFrame.samples = dataFrame.samples.map(function(curr, i, out) {
		return curr * stepSize;
	});
}

function quantizeLog(input, levels, range) {

}
