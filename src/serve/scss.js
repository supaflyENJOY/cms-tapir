const sass = require('node-sass'),
      fileReader = require('../fileReader.js'),
      env = process.env,
      path = require('path'),

      useSourceMaps = env.ENV === 'DEVELOP';

let cache = {};
module.exports = {
  setCache: function(theCache) {
    cache = theCache;
  },
  serve: async function(fileName, req, res, next) {

    fileName = dir(fileName);

    var dependency = new fileReader.Dependency(),
        data = await dependency.read(fileName)

        if(config.scss && config.scss.shared){
          data = `@import '${config.scss.shared}';`+';\n'+data;
        }
        sass.render( {
          data: data,
          file: fileName,//path.join( __dirname, dir, req.url ),
          sourceMap: useSourceMaps,
          importer: async function( url, prev, done ){ //file, prev, done
            if(url[0] === '/'){
              url = url.substr(1);
            }
            var displayName = path.relative( dir(config.template), path.resolve( path.dirname( prev ), url ) ).replace(/\\/g, '/');
            var name = path.resolve( path.dirname( prev ), url );
            var paths = util.path.resolve(url, path.dirname( prev ), [dir(config.template), dir('/')])

            for( var i = 0, _i = paths.length; i < _i; i++ ){
              try{
                done( {
                  contents: await dependency.read( paths[ i ] ),
                  file: util.path.getDisplayName( paths[ i ] ) // only one of them is required, see section Special Behaviours.
                } );
                console.log('Resolve scss dep ', url, 'for', paths[ i ]);

                return;
              }catch( e ){

              }
            }
            done(new Error(`Can not resolve dependency ${url} for ${prev}!`))
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
