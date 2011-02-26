// Copyright Steven Thurlow 2011
// Haven't figured out which Open Source licence to release under, so for now it's ALL MINE!!!! *evil* - Steven
// This means not yours, ask permission.

var dat = null;

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
	// callback is a hack, because the W3C spec doesn't account for AudioContext taking time to initialise
	var AudioContext = function(callback) {
		this.obj = document.createElement('object');
		this.obj.id = "audioFeed";
		this.obj.width = 300;
		this.obj.height = 300;

		var param1 = document.createElement('param');
		param1.setAttribute('name', 'movie');
		param1.setAttribute('value', 'audiofeed.swf');
		this.obj.appendChild(param1);

		var param2 = document.createElement('param');
		param2.setAttribute('name', 'allowScriptAccess');
		param2.setAttribute('value', '*');
		this.obj.appendChild(param2);

		var embed = document.createElement('embed');
		embed.setAttribute('src', 'audiofeed.swf');
		embed.setAttribute('name', 'audioFeed');
		embed.setAttribute('swliveconnect', 'true');
		embed.setAttribute('type', 'application/x-shockwave-flash');
		this.obj.appendChild(embed);
		document.body.appendChild(this.obj);
		
		if (callback) window["flAudioLoaded"] = callback;
	}
	AudioContext.prototype = {
		inputNodes: {},
		obj: null,
		createAudioInputSourceNode: function(id) {
			
			if (typeof(id) != "number") id = -1;
			
			if (!this.inputNodes[id]) {
				this.inputNodes[id] = {};
				this.inputNodes[id].__proto__ = AudioInputSourceNode.prototype;
			}
			var logged = false;
			var callbackName = "flAudioCallback" + (id >= 0 ? id.toString() : "");
			var self = this;
			window[callbackName] = function(data) {
				if (!dat) dat = data;
				var buffer = new AudioBuffer([data]);
				var event = new AudioProcessingEvent(self.inputNodes[id], new Date().valueOf(), buffer, null);
				if (self.inputNodes[id].onaudioprocess) self.inputNodes[id].onaudioprocess(event);
			}
			
			this.obj.getFeed(callbackName, id);
			
			return this.inputNodes[id];
		},
		get getAudioInputSources() {
			return this.obj.getFeeds();
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
