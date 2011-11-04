options = {
	boolSettings: ['ignoreLinks', 'useWadsworth'],
	initialize: function() {
		for(var i = this.boolSettings.length - 1; i >= 0; i--) {
			var setting = this.boolSettings[i];
			var checkbox = document.getElementById(setting);
			checkbox.checked = campfireTts.storage.getSetting(setting);
		}

		var voiceNameNode = document.getElementById('voiceName');
		var savedVoiceName = campfireTts.storage.getSetting('voiceName');
		chrome.tts.getVoices(function(voices) {
			for(var i = voices.length - 1; i >= 0; i--) {
				var node = document.createElement('option');
				var voiceName = voices[i].voiceName;
				if (voiceName == savedVoiceName) node.setAttribute('selected', '');
				node.setAttribute('value', voiceName);
				node.innerText = voiceName;
				voiceNameNode.appendChild(node);
			}
		});
	},
	saveOptions: function(event) {
		for(var i = this.boolSettings.length - 1; i >= 0; i--) {
			var opt = this.boolSettings[i];
			localStorage[opt] = document.getElementById(opt).checked;
		}

		localStorage['voiceName'] = document.getElementById('voiceName').value;

		chrome.extension.sendRequest({
			action: 'reloadSettings',
			payload: undefined
		});
	},

};