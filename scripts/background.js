// Holds state information and related functions
campfireTts.background = {
	initialize: function() {
		this.voiceName = campfireTts.storage.getSetting('voiceName');
		this.enqueueMode = campfireTts.storage.getSetting('enqueueMode');
		this.useWadsworth = campfireTts.storage.getSetting('useWadsworth');
		this.ignoreLinks = campfireTts.storage.getSetting('ignoreLinks');
		var patterns = campfireTts.storage.getSetting('userPatterns').split("\n");
		this.userPatterns = new Array(patterns.length);
		for (var i = patterns.length - 1; i >= 0; i--) {
			this.userPatterns[i] = new RegExp(patterns[i], "g");
		}
	},
	runFilters: function(text) {
		if (this.useWadsworth) text = this.wadsworth(text);
		if (this.ignoreLinks)  text = this.stripLinks(text);
		var numRegExp = this.userPatterns.length;
		for (var i = 0; i < numRegExp; i++) {
			text = text.replace(this.userPatterns[i], '');
		}
		return text;
	},
	wadsworth: function(text) {
		// End of the first 30% of the text
		var wIndex = Math.round(text.length * .3);
		// Nearest word boundary to the right
		var rIndex = text.indexOf(' ', wIndex) + 1;
		// Nearest word boundary to the left
		var lIndex = text.lastIndexOf(' ', text.slice(0, wIndex).lastIndexOf(' '));
		return rIndex - wIndex < wIndex - lIndex ? text.slice(rIndex) : text.slice(lIndex);
	},
	stripLinks: function(text) {
		// Matches anchor tags Campfire creates
		return text.replace(/(http|www)\S+/g, '');
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

			utterance = campfireTts.background.runFilters(utterance);

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