/*

Copyright (c) 2011, Steven Thurlow
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of aud.i-o nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


*/

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
