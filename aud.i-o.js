window['aud.i-o'] = (function(){
	var createAudioInputSourceNodeQueue = [];
	var isAudioLoaded = false;
	return {
		createAudioInputSourceNode: function(callbackName, id) {
			if (!isAudioLoaded) {
				createAudioInputSourceNodeQueue.push(function(){
					this.flashObject.getFeed(callbackName, id);
				});
			}
			else
				this.flashObject.getFeed(callbackName, id);
		},
		createFlashObject: function() {
			if (this.flashObject) return;

			this.flashObject = document.createElement('object');
			this.flashObject.id = "audioFeed";
			this.flashObject.width = 300;
			this.flashObject.height = 200;
			this.flashObject.style.display = 'block';
			this.flashObject.style.left = '10px';

			var param1 = document.createElement('param');
			param1.setAttribute('name', 'movie');
			param1.setAttribute('value', 'audiofeed.swf');
			this.flashObject.appendChild(param1);

			var param2 = document.createElement('param');
			param2.setAttribute('name', 'allowScriptAccess');
			param2.setAttribute('value', '*');
			this.flashObject.appendChild(param2);

			var embed = document.createElement('embed');
			embed.setAttribute('src', 'audiofeed.swf');
			embed.setAttribute('name', 'audioFeed');
			embed.setAttribute('swliveconnect', 'true');
			embed.setAttribute('type', 'application/x-shockwave-flash');
		
			this.flashObject.appendChild(embed);
		
			var div = document.createElement('div');
			div.id = 'audioFlashPromptNotice';
			div.style.position = 'absolute';
			div.style.top = "-220px";
			div.style.left = ((document.width - 320) / 2).toString() + "px";
			div.style.border = '3px solid black';
			div.style['background-color'] = "white";
			div.style['border-top'] = "none";
			div.style['border-radius'] = "0px 0px 10px 10px";
			div.style['padding-bottom'] = "10px";
			div.style['-webkit-transition'] = "top 1s ease-out";
			div.appendChild(this.flashObject);
			
			var self = this;
			window["flAudioLoaded"] = function() {
				isAudioLoaded = true;
				for (var i = 0; i < createAudioInputSourceNodeQueue.length; i++) createAudioInputSourceNodeQueue[i].apply(self);
			};

			document.body.appendChild(div);
		
			setTimeout(function() {div.style.top = "0px"}, 0);
			
			window["flAudioPermissionSelected"] = function() {
				div.style.top = "-220px";
			};
		},
		flashObject: null
	};
})();

if (!AudioBuffer) {
	var AudioBuffer = function(buffers) {
		this.buffers = buffers;
		this.numberOfChannels
	}
	AudioBuffer.prototype = {
		buffers: [],
		gain: 1.0,
		sampleRate: 44100,
		get bufLength() {
			return this.buffers[0].length;
		},
		get duration() {
			return (1 / sampleRate) * length;
		},
		get numberOfChannels() {
			return this.buffers.length;
		},
		getChannelData: function(channel) {
			return this.buffers[channel];
		}
	};
}

if (!AudioProcessingEvent) {
	var AudioProcessingEvent = function(node, playbackTime, inputBuffer, outputBuffer) {
		this.node = node;
		this.playbackTime = playbackTime;
		this.inputBuffer = inputBuffer;
		this.outputBuffer = outputBuffer;
	}
	AudioProcessingEvent.prototype = {
		node: null,
        playbackTime: null,
        inputBuffer: null,
        outputBuffer: null
	}
}

if (!AudioContext) {
	var AudioContext = function() {};
	AudioContext.prototype = {
		inputNodes: {},
		obj: null,
		createAudioInputSourceNode: function(id) {
			window['aud.i-o'].createFlashObject();
			if (typeof(id) != "number") id = -1;
			
			if (!this.inputNodes[id]) {
				this.inputNodes[id] = {};
				this.inputNodes[id].__proto__ = AudioInputSourceNode.prototype;
			}
			var logged = false;
			var callbackName = "flAudioCallback" + (id >= 0 ? id.toString() : "");
			var self = this;
			window[callbackName] = function(data) {
				var buffer = Float32Array ? new AudioBuffer([new Float32Array(data)]) : new AudioBuffer([data]);
				var event = new AudioProcessingEvent(self.inputNodes[id], new Date().valueOf(), buffer, null);
				if (self.inputNodes[id].onaudioprocess) self.inputNodes[id].onaudioprocess(event);
			}
			
			window['aud.i-o'].createAudioInputSourceNode(callbackName, id);
			
			return this.inputNodes[id];
		},
		get getAudioInputSources() {
			return window['aud.i-o'].flashObject.getFeeds();
		}
	};
}

if (!AudioNode) {
	var AudioNode = function() { throw "Invalid Constructor"; }
	AudioNode.prototype = {
		connect: function(destination, output, input) {
		},
		disconnect: function(output) {
		},
		context: null,
		numberOfInputs: 0,
		numberOfOutputs: 0
	};
}

if (!AudioSourceNode) {
	var AudioSourceNode = function() { throw "Invalid Constructor"; }
	AudioSourceNode.prototype = {};
	AudioSourceNode.prototype.__proto__ = AudioNode.prototype;
}

if (!AudioInputSourceNode) {
	var AudioInputSourceNode = function(id) { throw "Invalid Constructor"; }
	AudioInputSourceNode.prototype = {
		onaudioprocess: null,
		bufferSize: 0
	};
	AudioInputSourceNode.prototype.__proto__ = AudioSourceNode.prototype;
}
