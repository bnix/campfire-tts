options = {
	boolOptions: ['useWadsworth'],
	initialize: function() {
		for(var i = this.boolOptions.length - 1; i > -1; i--) {
			var opt = this.boolOptions[i];
			var checkbox = document.getElementById(opt);
			checkbox.checked = localStorage[opt] === 'false' ? false : true;
		}
	},
	saveOptions: function(event) {
		for(var i = this.boolOptions.length - 1; i > -1; i--) {
			var opt = this.boolOptions[i];
			localStorage[opt] = document.getElementById(opt).checked;
		}
		chrome.extension.sendRequest({
			action: 'reloadSettings',
			payload: undefined
		});
	}
};