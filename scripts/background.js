var campfireTts = {};
// Holds state information and related functions
campfireTts.background = {
	initialize: function() {
		this.enqueueMode = this.getSetting('enqueueMode', true);
		this.useWadsworth = this.getSetting('useWadsworth', false);
	},
	wadsworth: function(text) {
		// End of the first 30% of the text
		var wIndex = Math.round(text.length * .3);
		// Nearest word boundry to the right
		var rIndex = text.indexOf(' ', wIndex) + 1;
		// Nearest word boundry to the left
		var lIndex = text.lastIndexOf(' ', text.slice(0, wIndex).lastIndexOf(' '));
		return rIndex - wIndex < wIndex - lIndex ? text.slice(rIndex) : text.slice(lIndex);
	},
	getSetting: function(setting, defaultValue) {
		var val = localStorage[setting]
		if (val === null) localStorage[setting] = val = defaultValue;
		return this.convertSetting(val, defaultValue);
	},
	convertSetting: function(str, target) {
		switch(typeof(target)) {
		case "boolean":
			return str === 'false' ? false : true;
		case "number":
			return str.indexOf('.') !== -1 ? parseFloat(str) : parseInt(str);
		default:
			return str;
		}
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
				console.log("using wadsworth");
			}
			
			var ttsOpts = {
				'lang': 'en-US',
				//'enqueue': campfireTts.background.enqueueMode
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