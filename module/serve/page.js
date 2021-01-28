const BabelPluginExtractImportNames = require('./babel-import-extractor.js')
var cacheCode = {};
var bCore = require( "@babel/core" ),
  Util = require('util'),
  path = require('path'),

  fileReader = require('../../src/fileReader.js'),
  useSourceMaps = process.env.ENV === 'DEVELOP';

let cache = {};

var jsx = require('./jsx.js');

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
			var inputs = Object.assign({}, additional.scope, {
				pageCode: js.data.code+`
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