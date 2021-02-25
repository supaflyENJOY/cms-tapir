const fs = require( 'fs' );
const path = require( 'path' );
var fileReader = require('../src/fileReader.js');
const serves = require('./serve/all.js');

const staticCache = {};
const fetch = require("node-fetch");

var Serve = function(main) {
	this.main = main;
	this.middleware = this.middleware.bind(this);
	main.registerModule('Serve', this);
};
Serve.prototype = {
	expose: ['serve', 'complexServe', 'setStatic', 'isStatic'],
	complexServe: async function(fileName, cb) {
		if(fileName.match(/^https?:/)){
			const url = fileName;


			try {
				const response = await fetch(url);
				return {data: {code: (await response.buffer()).toString('utf-8')}};
				console.log(json);
			} catch (error) {
				console.log(error);
			}


			return
		}else{
			var { file, data } = await util.path.resolve( fileName, null, this.main.config.static );
			if(!file){
				return await this.serve( fileName, cb );
			}else{
				return {data: {code: data}};
			}
		}

	},
	serve: async function(fileName, cb) {
		var templates = this.main.config.template,
				data, resolved = false,
				serveType,
				additional;

		if(fileName in this.main.routes){
			serveType = 'page';
		}else if(fileName.charAt(0) === '/' && fileName.substr(1) in this.main.routes){
			fileName = fileName.substr(1);
			serveType = 'page';
		}


		if(serveType === 'page'){
			additional = {route: this.main.routes[fileName], scope: this.main.scope, main: this.main};
			fileName = path.join('page', additional.route.page +'.jsx');
		}

		for( var i = 0, _i = templates.length; i < _i; i++ ){
			try{
				var template = templates[ i ],
					file = template.file( fileName );
				data = await fileReader.read( file );
				resolved = true;
				break;
			}catch( e ){

			}
		}

		var result;
		if( resolved ){
			if(!serveType){
				serveType = file.ext;
			}

			if( serveType in serves ){
				try{
					result = await serves[ serveType ].serve( file, data, this.main.config, additional );
					result.server = serves[ serveType ];
				}catch( e ){
					result = { error: true, data: e }
				}
			}
		}else{
			result = false;
		}

		if(cb)
			cb(result.error, result.data)
		return result;
	},
	isStatic: function(name, code) {
		if(name[0] !== '/')
			name = '/'+name;

		return name in staticCache;
	},
	setStatic: function(name, code) {
		if(name[0] !== '/')
			name = '/'+name;

		staticCache[name] = {server: serves.plain, data: {code: code}};
	},
	middleware: async function(req, res, next) {
		var result;
		if(req.originalUrl in staticCache){
			result = staticCache[req.originalUrl];
		}else{
			result = await this.serve(req.originalUrl);
		}
		
		if(result && !result.error){
			if(result.server && ('response' in result.server)){
				result.server.response(req, res, result, staticCache);
			}
			res.end(result.data.code);

		}else{
			next();
		}
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