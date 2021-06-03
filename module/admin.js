const fs = require( 'fs' );
const path = require( 'path' );
var fileReader = require('../src/fileReader.js');
const serves = require('./serve/all.js');
const JSON5 = require('json5');

const staticCache = {};
const fetch = require("node-fetch");

var Admin = function(main) {
	this.main = main;
	main.registerModule('Admin', this);
};

const { resolve } = require('path');
const { readdir } = require('fs').promises;
var getFiles = async function (dir) {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(dirents.map((dirent) => {
		const res = resolve(dir, dirent.name);
		return dirent.isDirectory() ? getFiles(res) : res;
	}));
	return Array.prototype.concat(...files);
}

Admin.prototype = {
	generateAdminAPI: function() {
		var main = this.main;

		var methods = {
			'GET:/[live]': {fn: async function() {
				debugger
					await new Promise(resolve1 =>setTimeout(resolve1, 2000));
					return {};
			}},
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
			'POST:/admin/block/list': {
				fn: async function(args) {

					var files = await Promise.all(main.config.template.map(function(dir) {
						dir = dir.clone();
						dir.dir = path.join(dir.dir, 'block');
						dir.path = dir.toString();
						return getFiles(dir.path)
					}));

					var matchedFiles = [].concat.apply([], files.map((dirFiles, n)=>{
						var dir = main.config.template[n].clone();
						dir.dir = path.join(dir.dir, 'block');
						dir.path = dir.toString();

						return dirFiles
							.filter(function(file) {
								return file.split('.').pop() === 'jsx'
							})
							.map(function(file){
								return path.relative(dir.path, file)
							})
							.map(a=>util.path.normalize(a))
							.map(a=>{
								var tokens = a.split('.');
								tokens.pop();
								return tokens.join('.');
							});

					})).sort();
					return {block: matchedFiles};
				}
			}
		};

		['block', 'page'].forEach(function(type) {
			methods['POST:/admin/'+type+'/get'] = {
				options: {
					name: {type: String}
				},
				fn: async function(args, c) {
					if(type === 'page'){
						var additional = { route: main.routes[ args.name ] };
						if( !additional.route ){
							return false;
						}
					}else{
						var additional = { route: {page: args.name} };
					}
					debugger
					var fileName = path.join(type, additional.route.page +'.jsx');
					var manifest = path.join(type, additional.route.page +'.json5');

					try{
						var mainFile = await util.path.resolve( fileName, null, main.config.template );
						var manifestFile = await util.path.resolve( manifest, null, main.config.template );
					}catch(e){

					}

					if(mainFile && mainFile.file){
						return {file: mainFile.file._fileName, data: mainFile.data, manifest: manifestFile ? JSON5.parse(manifestFile.data) : {}};
					}else{
						return false;
					}

				}
			};

		});

		return methods;

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