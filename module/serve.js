const fs = require( 'fs' );
const path = require( 'path' );
var fileReader = require('../src/fileReader.js');
const serves = require('./serve/all.js');

var Serve = function(main) {
	this.main = main;
	main.registerModule('Serve', this);
};
Serve.prototype = {
	expose: ['serve'],
	serve: async function(fileName, cb) {
		var templates = this.main.config.template,
				data;

		for( var i = 0, _i = templates.length; i < _i; i++ ){
			try{
				var template = templates[ i ],
						file = template.file( fileName ),
						data = await fileReader.read( file );

				break;
			}catch( e ){

			}
		}

		var result;
		if(file){
			if(file.ext in serves){
				try{
					result = await serves[ file.ext ].serve( file, data, this.main.config );
				}catch(e){
					result = {error: true, data: e}
				}
			}
		}else{
			result = false;
		}
		if(cb)
			cb(result.error, result.data)
		return result;
	},
	init: function() {
		const actual = this.main.actual;

	},
	'~destroy': function(cb) {
		cb && cb();
	},
	constructor: Serve
};
module.exports = Serve