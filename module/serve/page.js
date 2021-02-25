const BabelPluginExtractImportNames = require('./babel-import-extractor.js')
var cacheCode = {};
var bCore = require( "@babel/core" ),
  Util = require('util'),
  path = require('path'),

  fileReader = require('../../src/fileReader.js'),
  useSourceMaps = process.env.ENV === 'DEVELOP';

let cache = {};

var jsx = require('./jsx.js');
var cachedCache = {};
const { minify } = require("terser");

module.exports = {
  setCache: function(theCache) {
    cache = theCache;
  },
	response: function(req, res) {

	},
  serve: async function(file, code, config, additional){
  	var result;
    var dependency = new fileReader.Dependency();
    var html = additional && additional.route && additional.route.html || config.html;
    var resolved = await util.path.resolve(html, null, config.template);
    if(!resolved){
    	console.error(`ERROR Cannot serve: '${file.path}' because can not resolve '${html}'`);
    	return false;
		}
    var htmlData = await dependency.read(resolved);
		var js = await jsx.serve(file, code);
		var config = {};
		if(htmlData && (js && !js.error)){
			var cachedBundle = '';
			if(additional.route.cache){
				var cacheLine = additional.route.cache.join(';;');
				if(cacheLine in cachedCache){
					cachedBundle = cachedCache[cacheLine];
				}else{
					var all = await Promise.all( additional.route.cache.map( async function( name ){
						try{
							return await additional.main.serve( name )
						}catch( e ){
							return false;
						}
					} ) );
					try{
						cachedCache[ cacheLine ] = cachedBundle = ( await minify( all.reverse().filter( a => a ).map( a => a.data.code ).join( ';' ) ) ).code;
					}catch(e){
						console.error('Cache minification error')
					}
				}
			}
			var cachedScripts = '';

			if(additional.main.config.scripts){
				var cacheScriptsFileName = `/__cache${file.subPath.replace(/[\\\/]/g, '_')}.js`;
				if(!additional.main.isStatic(cacheScriptsFileName)){
					cacheLine = additional.main.config.scripts.join( ';;' )
					var all = await Promise.all( additional.main.config.scripts.map( async function( name ){
						try{
							return await additional.main.complexServe( name )
						}catch( e ){
							return false;
						}
					} ) );
					try{
						additional.main.setStatic( cacheScriptsFileName, ( await minify( all.filter( a => a ).map( a => a.data.code ).join( ';' ) ) ).code )
						//cachedCache[ cacheLine ] = cachedScripts = ;
						cachedScripts = `<script src="${cacheScriptsFileName}"></script>`;
					}catch( e ){
						console.error( 'Cache minification error', e )
					}
				}else{
					cachedScripts = `<script src="${cacheScriptsFileName}"></script>`;
				}
			}
			var inputs = Object.assign({}, additional.scope, {
				scripts: cachedScripts,
				pageCode: cachedBundle+js.data.code+`
    define('start', ['${util.path.normalize(file.subPath)}'], function(main) {
      D.appendChild(document.body, main.default(
        new Store(${JSON.stringify(config)}).bindings()
      ))
    });`
			});
			var finalHTML = htmlData;
			for(var key in inputs){
				finalHTML = finalHTML.replace(new RegExp('%'+key.toUpperCase()+'%', 'g'), typeof inputs[key] === 'object' ? JSON.stringify(inputs[key]): inputs[key])
			}

			result = {error: false, data: {
					code: finalHTML
				}
			};
		}else{
			result = {error: true, data: []};
		}

		return result;
  }
}