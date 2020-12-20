const BabelPluginExtractImportNames = require('../babel-import-extractor.js')
var cacheCode = {};
var bCore = require( "@babel/core" ),
  Util = require('util'),
  path = require('path'),

  fileReader = require('../fileReader.js'),
  useSourceMaps = process.env.ENV === 'DEVELOP';

var transformJSX = function(code, fileName, dependency, realPath, cb) {
  const importExtractor = new BabelPluginExtractImportNames();

  if(code in cacheCode){
    return cb(cacheCode[code].error, cacheCode[code].code)
  }
  bCore.transform(
    code,
    {
      "plugins": [
        [ require("@babel/plugin-transform-react-jsx"), {
          "pragma": "D.h", // default pragma is React.createElement
          "pragmaFrag": "D.f", // default is React.Fragment
          "throwIfNamespace": false // defaults to true
        } ],
        //[simpleTransformToAMD]
        [importExtractor.plugin],
        [require('@babel/plugin-transform-modules-amd')]
      ],
      sourceMaps: useSourceMaps,
      sourceFileName: fileName,
      moduleId: fileName
    }, async function( c, d, e ){
      if(c){
        cacheCode[code] = {error: new Error(c.message)};
        cb(cacheCode[code].error);
      }else{
        /*await Promise.all(importExtractor.state.map(async item=>{
          var importFileName = util.path.resolve(item.from, realPath, [dir(config.template), dir('/')]);
          if(importFileName.length>1){
            debugger
          }
          importFileName = importFileName[0].replace(/\\/g, '/');
          if(!(('/'+util.path.getDisplayName(importFileName)) in cache)){
            // add to cache
            try{
              var resolved = require.resolve( item.from, {
                paths: [path.parse(path.resolve(fileName)).dir].concat(module.paths)
              } );
            }catch( e ){
              console.error('can not resolve '+fileName)
            }
            if(resolved){
              cache[ '/' + util.path.getDisplayName( importFileName ) ] = `define("${util.path.getDisplayName( item.from )}", ["exports"], function(_exports){${
                await fileReader.read( resolved )
              };_exports.default = ${item.name};_exports.__esModule = true;});`
            }
          }
        }));*/
        cacheCode[code] = {error: false, code: d};
        cb(false, d);
      }
    } );
};
const transformJSXPromised = Util.promisify(transformJSX);
let cache = {};

module.exports = {
  setCache: function(theCache) {
    cache = theCache;
  },
  transformJSX: transformJSXPromised
}