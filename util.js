var path = require('path');
module.exports = function(base) {
  const util = global.util = {
    root: base || __dirname,
    path: {
      resolve: function(filePath, prev, dirs) {
        if(filePath[0] === '/'){
          return [path.relative(util.root, path.join(util.root, filePath.substr(1)))];
        }else{
          if(filePath[0] === '.'){
            var relative = path.posix.join(path.parse(prev).dir, filePath);

            return [path.relative(util.root, relative)]
          }

          const possible = [];
          for( var i = 0, _i = dirs.length; i < _i; i++ ){

            /*if(filePath.match(/^src\//) && dirs[ i ].match(/[\\\/]template$/))
              continue*/

            var possibility = path.join(dirs[ i ], filePath);

            if(path.relative(util.root, possibility)[0] === '.')
              continue;
            possible.push(possibility);
          }
          return possible;
        }
      },
      getDisplayName: function(filePath) {
        console.log(filePath);
        if(filePath.indexOf('template/')===0)
          filePath = filePath.substr('template/'.length);
        return filePath;
      },
      getOsPath: function(filePath) {
        return filePath.split(path.posix.delimiter).join(path.delimiter);
      }
    }
  };
};
