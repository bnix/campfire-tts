var campfireTts = {
	chat: null,
	initialize: function() {
		this.chat = document.getElementById('chat-wrapper');
		this.chat.addEventListener('DOMNodeInserted', this.onNewMessage, false);
		chrome.extension.sendRequest({
			action: 'initialize',
			payload: undefined
		});
	},
	onNewMessage: function(event) {
		node = event.target;
		if(node.nodeType === 1 && campfireTts.shouldSpeak(node)) {
			chrome.extension.sendRequest({
				action: 'speak',
				payload: [campfireTts.extractMessage(node)]
			});
		}
	},
	extractMessage: function(node) {
		// Looking for <div class="body">
		return node.getElementsByTagName('div')[0].innerText;
	},
	shouldSpeak: function(node) {
		return node.className.indexOf('text_message') !== -1;
	}
};

campfireTts.initialize();