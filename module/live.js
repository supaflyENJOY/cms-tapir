const fs = require( 'fs' );

const Live = function(main) {
	this.main = main;
	main.registerModule('Live', this);
	this.files = {};
	this._rebuild = Store.debounce(this._rebuild.bind(this), 200);
}

var Store = require('../src/core/data/store/Store.js');

Live.prototype = {
	expose: ['fileChanged'],
	init: function(){
		this.fileChanged = this.fileChanged.bind(this);
		var lives = this.lives = [];
		var _self = this;
		console.log({lives})
		this.main.on('afterInit', ()=>{

			this.main.api( {
				'GET:/\\[live\\]': {
					timeout: 60*1000*5,
					middleware: function(req, res){
						console.log(_self.lives.length, lives.length)
						lives.push( res );
					}
				}
			});
		})
	},
	fileChanged: function(fileName, file) {
		//debugger
		//console.log('change', fileName, file)
		this.files[fileName] = {main: this.main, file: file};
		this._rebuild();
	},
	_rebuild: async function() {
		var out = [];
		for( var f in this.files){
			var item = this.files[f];
			if(item.file){
				console.log('rebuilding',  item.file.subPath )
				var result = await item.main.serve( item.file.subPath );
				if(!result.error){
					console.log('rebuilded',  item.file.subPath )
					out.push({file: item.file.subPath, content: result.data.code});
				}
			}
		}
		console.log('reply', out.length, this.lives.length)
		if(out.length){
			this.lives.forEach(res => {
					res.end( JSON.stringify( out ) );
				}
			)
		}
	},
	'~destroy': function( cb ){

	}
};

module.exports = Live;