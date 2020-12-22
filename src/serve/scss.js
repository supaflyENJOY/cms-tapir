const sass = require('node-sass'),
      fileReader = require('../fileReader.js'),
      env = process.env,
      path = require('path'),

      useSourceMaps = env.ENV === 'DEVELOP';

let cache = {};
module.exports = {
  setCache: function(theCache, useCache) {

    cache = theCache;
  },
  serve: async function(fileName, req, res, next) {


    var dependency = new fileReader.Dependency(), data;
    var dirsToSearch = [projectDir(config.template), dir(config.template), projectDir('/'), dir('/')]
    var paths = util.path.resolve(fileName, projectDir(config.template), dirsToSearch);

    var data;
    for( var i = 0, _i = paths.length; i < _i; i++ ){
      try{
        console.log( fileName )
        data = await dependency.read( paths[ i ] );
        fileName = paths[ i ];
      }catch( e ){
        continue;
      }
    }

    if(!data){
      throw new Error( `No file ${fileName}` )
    }


        if(config.scss && config.scss.shared){
          data = `@import '${config.scss.shared}';`+';\n'+data;
        }
        sass.render( {
          data: data,
          file: fileName,//path.join( __dirname, dir, req.url ),
          sourceMap: useSourceMaps,
          importer: function( url, prev, done ){ //file, prev, done
            console.log(url)
            if(url[0] === '/'){
              url = url.substr(1);
            }
            var displayName = path.relative( projectDir(config.template), path.resolve( path.dirname( prev ), url ) ).replace(/\\/g, '/');
            var name = path.resolve( path.dirname( prev ), url ),
                prevDir = path.dirname( prev ),
                dirsToSearch = [projectDir(config.template), prevDir, dir(config.template), projectDir('/'), dir('/')]
            ;

            var paths = util.path.resolve(url, prevDir, dirsToSearch);
            ;(async function() {
              for( var i = 0, _i = paths.length; i < _i; i++ ){
                try{
                  var fileData = await dependency.read( paths[ i ] );
                  //debugger
                  done( {
                    contents: fileData,
                    file: util.path.getDisplayName( paths[ i ] ) // only one of them is required, see section Special Behaviours.
                  } );
                  //console.log('Resolve scss dep ', url, 'for', paths[ i ]);

                  return;
                }catch( e ){

                }
              }
              done(new Error(`Can not resolve dependency ${url} for ${prev}!`));
            })();
          }
        }, function( err, result ){
          if( err ){
            const errorText = `Error at ${err.file}:\n` + err.formatted;
            return res.end( errorText )
          }
          res.set( 'Content-type', 'text/css; charset=UTF-8' );
          res.end( result.css )
        } );

  }
}
