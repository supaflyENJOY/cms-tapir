const fs = require( 'fs' );
const path = require( 'path' );
var fileReader = require('../src/fileReader.js');
const serves = require('./serve/all.js');

const staticCache = {};
const fetch = require("node-fetch");

var Admin = function(main) {
	this.main = main;
	main.registerModule('Admin', this);
};
Admin.prototype = {
	generateAdminAPI: function() {
		var main = this.main;
		return {
			'POST:/admin/page/list': {
				fn: function() {
					var out = [];

					for(var route in main.routes){
/*						var tokens = route.split(/\//).filter(a=>a);*/
						out.push({path: route, page: main.routes[route].page})
					}

					return out;
				}
			},
			'POST:/admin/page/get': {
				options: {
					page: {type: String}
				},
				fn: async function(args, c) {

					var additional = {route: main.routes[args.page]};
					if(!additional.route){
						return false;
					}
					fileName = path.join('page', additional.route.page +'.jsx');
					var manifest = path.join('page', additional.route.page +'.json5');

					try{
						var mainFile = await util.path.resolve( fileName, null, main.config.template );
						var manifestFile = await util.path.resolve( manifest, null, main.config.template );
					}catch(e){

					}

					if(mainFile && mainFile.file){
						return {file: mainFile.file._fileName, data: mainFile.data, manifest: manifestFile.data};
					}else{
						return false;
					}

				}
			}
		};
	},

	init: function(){
		const main = this.main;

		main.on('afterInit', () => {
			main.extendAPI(this.generateAdminAPI());
		});
	},
	'~destroy': function( cb ){
		cb && cb();
	},
	constructor: Admin
};
module.exports = Admin