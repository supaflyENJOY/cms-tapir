var watch = require('recursive-watch');
	//,ws = require('ws');

var WatchWSL = function(dir, callback){

	return watch(dir, function(fileName) {
		if(fileName.indexOf('_tmp_')>-1 || fileName.indexOf('_old__')>-1)
			return;

		callback(fileName);
	});
}
module.exports = WatchWSL;