if(typeof global.document !== void 0) {
  // other way sass would think that it is in the browser env and would not expose its API
  var gDocument = global.document;
  global.document = void 0;
}
const sass = require('sass'),
  fileReader = require('../../src/fileReader.js'),
  env = process.env,
  path = require('path'),

  useSourceMaps = env.ENV === 'DEVELOP';

if(typeof gDocument !== void 0) {
  global.document = gDocument;
}

let cache = {};
let pathCache = {};
var isServing = false;
var q = [];
var scssQueue = function() {
  var r;
  var p = new Promise(function(resolve) {
    r = resolve;
  });
  q.push(r);
  //console.log(q)
  return p;
};
var nextScssFromQueue = function() {
  if(q.length){
    return q.pop()();
  }else{
    isServing = false;
  }
}
module.exports = {
  setCache: function(theCache, useCache) {

    cache = theCache;
  },
  response: function(req, res) {
    res.set( 'SourceMap', req.url + '.map' );
    res.set( 'Content-type', 'text/css; charset=UTF-8' );

    /*if(result.error){
      res.end( result.data );
    }else{

      res.end( result.data )
    }*/
  },
  serve: async function(file, code, config) {
    if(isServing){
      await scssQueue();
    }
    isServing = true;
    var dependency;

    if(!code){
      dependency = new fileReader.Dependency();
      code = await dependency.read(file);
    }else{
      dependency = new fileReader.Dependency(file);
    }

    var baseFile = file;
    
    var result = await dependency.result(async function(){
      return await (new Promise( function( resolve, reject ){

        if( config.scss && config.scss.shared ){
          code = `@import '${config.scss.shared}';` + ';\n' + code;
        }
        pathCache[file.path] = baseFile;
        sass.render( {
          data: code,
          file: util.path.normalize(file.subPath),//path.join( __dirname, dir, req.url ),
          sourceMap: useSourceMaps,
          importer: function( url, prev, done ){ //file, prev, done
            ;(async function(){

              var baseFilePointer = pathCache[prev] || baseFile;

              var {file, data} = await util.path.resolve( url, baseFilePointer, config.template.slice().concat( config.static ).concat( config.scssBaseDir ) );
              //console.log('  ~', baseFilePointer.path, prev, (file ? ' resolved ':' not resolved'), file?file.path:url);

              if(!file && url[0] !== '.' && url[0] !== '/'){
                var {file, data} = await util.path.resolve( './'+url, baseFilePointer, config.template.slice().concat( config.static ).concat( config.scssBaseDir ) );
                /*if(file && file.path)
                  console.log('  ~', baseFile.path, (file ? ' resolved ':' not resolved'), file?file.path:url);*/
              }
              if( file ){
                //console.log('resolved ', url,'as', file.path)
                pathCache[url] = file;
                if(url[0] === '/'){
                  pathCache[ url.substr( 1 ) ] = file;
                }else{
                  pathCache[ '/'+url ] = file;
                }
                var fileData = await dependency.read( {file, data} );

                done( {
                  contents: fileData,
                  file: util.path.normalize(file.subPath)
                } );
              }else{
                console.error(`ERROR SCSS: can not resolve ${url} from ${baseFilePointer.path}!`)
                done( new Error( `Can not resolve dependency ${url} for ${prev}!` ) );
              }
            })();
          }
        }, function( err, result ){
          if( err ){

            const errorText = `Error at ${err.file}:\n` + err.formatted;
            return resolve({error: true, data: errorText});
          }
          resolve({error: false, data: {code: result.css.toString('utf-8'), map: result.map}});
        } );
      }));
    });
    nextScssFromQueue();
    return result;
  }
}
