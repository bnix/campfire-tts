var campfireTts = {};
// Local storage utility functions
campfireTts.storage = {
	defaults: {
		'voiceName': '',
		'ignoreLinks': true,
		'useWadsworth': false,
		'enqueueMode': true,
		'userPatterns': ''
	},
	getSetting: function(setting) {
		var val = localStorage[setting];
		if (val === undefined) localStorage[setting] = val = this.defaults[setting];
		return this.convertSetting(val, this.defaults[setting]);
	},
	convertSetting: function(str, target) {
		switch(typeof(target)) {
		case 'boolean':
			return str === 'false' ? false : true;
		case 'number':
			return str.indexOf('.') !== -1 ? parseFloat(str) : parseInt(str);
		default:
			return str;
		}
	}
};