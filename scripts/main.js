require.ready(function(){
	require(["codec/codec"], function(codec) {

		function drawWaveForm(canvas, samples) {
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "rgba(255,255,255,0.5)";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.strokeStyle = "rgb(0,0,0)";

			ctx.beginPath();
			ctx.moveTo(0,canvas.height/2);
			samples.forEach(function(curr, i) {
				var y = Math.floor(curr * canvas.height / 2) + canvas.height / 2;
				ctx.lineTo(i, y);
				ctx.moveTo(i, y);
			});
			ctx.stroke();
		}
		
		codec.oncompress = function(dataFrame) {
			codec.decompress(dataFrame);
		};

		function drawAllSamples(samples, seeds) {
			drawWaveForm(document.getElementById('full'), samples);
			
			codec.ondecompress = function(uncompressed) {
				drawWaveForm(document.getElementById('compressed'), uncompressed);

				var diff = [];
				for (var i = 0; i < uncompressed.length; i++) {
					diff.push((samples[i] - uncompressed[i]));
				}
				drawWaveForm(document.getElementById('delta'), diff);
			};
			
			codec.compress(samples, 4);
		}

		var ac = new AudioContext(function() {
			var node = ac.createAudioInputSourceNode();
			var seeds = [0];
			node.onaudioprocess = function(event) {
				// Draw waveform
				var buf = event.inputBuffer.getChannelData(0);
				while (buf.length > 0) {
					var sub = buf.slice(0, 512);
					buf = buf.slice(512);
					drawAllSamples(sub, seeds);
					// Seed the next buffer frame with the last N values of the current buffer
					// where N is the order of prediction in the codec.
					seeds = sub.slice(sub.length - 1);
				}
			};
		});
	});
});
