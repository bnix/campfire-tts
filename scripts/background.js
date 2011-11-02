// Holds state information and related functions
campfireTts.background = {
	initialize: function() {
		this.voiceName = campfireTts.storage.getSetting('voiceName');
		this.enqueueMode = campfireTts.storage.getSetting('enqueueMode');
		this.useWadsworth = campfireTts.storage.getSetting('useWadsworth');
	},
	wadsworth: function(text) {
		// End of the first 30% of the text
		var wIndex = Math.round(text.length * .3);
		// Nearest word boundry to the right
		var rIndex = text.indexOf(' ', wIndex) + 1;
		// Nearest word boundry to the left
		var lIndex = text.lastIndexOf(' ', text.slice(0, wIndex).lastIndexOf(' '));
		return rIndex - wIndex < wIndex - lIndex ? text.slice(rIndex) : text.slice(lIndex);
	}
};

// Functions accessible by the content script and options script
campfireTts.responder = {
	initialize: function(sender) {
		chrome.pageAction.show(sender.tab.id);
	},
	finalize: function() {
		chrome.tts.stop();
	},
	speak: function(utterance, sender) {
		chrome.windows.get(sender.tab.windowId, function(window){
			if (window.focused && sender.tab.selected) return;
			if (campfireTts.background.useWadsworth) {
				utterance = campfireTts.background.wadsworth(utterance);
			}
			
			var ttsOpts = {
				'voiceName': campfireTts.background.voiceName
			};
			chrome.tts.speak(utterance, ttsOpts, function() {
				console.log(utterance);
				if (chrome.extension.lastError) {
					console.log('Error: ' + chrome.extension.lastError.message);
				}
			});
		});
	},
	reloadSettings: function() {
		campfireTts.background.initialize();
	}
};

campfireTts.background.initialize();
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var params = (request.payload || []).concat(sender, sendResponse);
		campfireTts.responder[request.action].apply(campfireTts.responder, params);
	}
);