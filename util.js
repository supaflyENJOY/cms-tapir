var path = require('path');
var Dir = require('./dir.js');
var fileReader = require('./src/fileReader.js');


const util = module.exports =  global.util = {
  root: __dirname,
  path: {
    resolve: async function( filePath, prevFile, dirs ){

      var data, file;
      if(filePath[0] === '.'){
        file = prevFile.dir.clone().file(path.join(prevFile.subDir, filePath))
        try{
          data = await fileReader.read( file )
          return file;
        }catch(e){ }
      }else if(filePath[0] === '/'){
        for( var i = 0, _i = dirs.length; i < _i; i++ ){
          try{
            file = dirs[i].file(filePath)
            data = await fileReader.read( file );
            console.log('match', file.path)
            return file
            break;
          }catch( e ){ }
        }
      }

      return false;

      path.join(prevFile.dir.path,prevFile.subDir, filePath)
      debugger
      if( filePath[ 0 ] === '/' ){
        return [ path.relative( util.root, path.join( util.root, filePath.substr( 1 ) ) ) ];
      }else{
        if( filePath[ 0 ] === '.' ){
          var relative = path.posix.join( path.parse( prev ).dir, filePath );

          return [ path.relative( util.root, relative ) ]
        }

        const possible = [];
        for( var i = 0, _i = dirs.length; i < _i; i++ ){

          /*if(filePath.match(/^src\//) && dirs[ i ].match(/[\\\/]template$/))
						continue*/

          var possibility = path.join( dirs[ i ], filePath );

          if( path.relative( util.root, possibility )[ 0 ] === '.' )
            continue;
          possible.push( possibility );
        }
        return possible;
      }
    },
    getDisplayName: function( filePath ){
      console.log( filePath );
      if( filePath.indexOf( 'template/' ) === 0 )
        filePath = filePath.substr( 'template/'.length );
      return filePath;
    },
    getOsPath: function( filePath ){
      return filePath.split( path.posix.sep ).join( path.sep );
    }
  },
  deepAssign: function( a, b ){
    if( !b )
      return a;

    for( var key in b ){
      if( typeof b[ key ] === 'object' ){
        if( Array.isArray( b[ key ] ) ){
          if( Array.isArray( a[ key ] ) ){
            a[ key ] = a[ key ].concat( b[key] );
          }else{
            a[ key ] = b[ key ];
          }
        }else{
          if( a[ key ] === void 0 ){
            a[ key ] = b[ key ];
          }else{
            util.deepAssign( a[ key ], b[ key ] );
          }
        }
      }else{
        a[ key ] = b[ key ];
      }
    }
    return a;
  }
};

