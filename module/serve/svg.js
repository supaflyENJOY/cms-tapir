const fileReader = require('../../src/fileReader.js'),
      env = process.env,
      path = require('path'),

      useSourceMaps = env.ENV === 'DEVELOP';

let cache = {}, cacheCode = {};
var bCore = require( "@babel/core" );
module.exports = {
  setCache: function(theCache, useCache) {
    cache = theCache;
  },
  serve: async function(file, code) {
    var dependency;

    if(!code){
      dependency = new fileReader.Dependency();
      code = await dependency.read(file);
    }else{
      dependency = new fileReader.Dependency(file);
    }

    /*if( code in cacheCode ){
      return cacheCode[ code ];//.error, cacheCode[code].code)
    }*/


    var result = await dependency.result(async function(){
      return await (new Promise( function( resolve, reject ){


       // pathName = pathName.replace( 'template//', '' ).replace( 'template/', '' )
        //debugger//"${req.url.replace(/\//g,'.').split('.').filter(String).join('.')}"
        bCore.transform(
          `const SVG = D.declare("${file.subPath}", (cfg)=>{ return ${( code + '' ).replace( /(<svg[^>]+"\s*)>/i, '$1 {...cfg}>' )}; });
            export default SVG;
            `,
          {
            "plugins": [
              [ require( "@babel/plugin-transform-react-jsx" ), {
                "pragma": "D.s", // default pragma is React.createElement
                "throwIfNamespace": false // defaults to true
              } ],
              [ require( '@babel/plugin-transform-modules-amd' ) ]
            ],
            sourceMaps: useSourceMaps,
            sourceFileName: util.path.normalize(file.subPath),
            moduleId: util.path.normalize(file.subPath)
          }, function( err, result ){
            if( err ){
              //res._log('!Error in transforming svg', err);
              cacheCode[ code ] = { error: new Error( err.message ), data: [err] };
              resolve(cacheCode[ code ]);
            }else{
              resolve({error: false, data: result});
            }
          } );

      } ));
    });
    return result;
  },
  response: function(req, res) {
    res.set( 'SourceMap', req.url + '.map' );
    res.header( 'Content-Type', 'text/javascript' );
  },
  serveOld: async function(fileName, req, res, next){
    var pathName = fileName;
    var dependency = new fileReader.Dependency(), data;
    try{
      console.log( fileName )
      data = await dependency.read( projectDir( fileName ) );
      fileName = projectDir( fileName );
    }catch( e ){
      try{
        data = await dependency.read( dir( fileName ) );
        fileName = dir( fileName );
      }catch( e ){
        console.log('no file', e)
        data = false;/* `<svg width="260" height="73" viewBox="0 0 260 73" xmlns="http://www.w3.org/2000/svg">
<text y="5" font-size="32" font-weight="bold"
    font-family="Avenir, Helvetica, sans-serif">
Can not find SVG! ${fileName}</text></svg>`;*/
      }
    }


    if(result.error){
      res.end(result.data);
    }else{
      res.set( 'SourceMap', req.url + '.map' );
      res.header( 'Content-Type', 'text/javascript' );
      res.end( result.data );

    }
  }
}
