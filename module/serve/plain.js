let cache = {};
module.exports = {
  setCache: function(theCache, useCache) {
    cache = theCache;
  },
  response: function(req, res) {
    /*res.set( 'SourceMap', req.url + '.map' );
    res.set( 'Content-type', 'text/css; charset=UTF-8' );*/

    /*if(result.error){
      res.end( result.data );
    }else{

      res.end( result.data )
    }*/
  },
  serve: async function(file, code, config) {
    var dependency;

    if(!code){
      dependency = new fileReader.Dependency();
      code = await dependency.read(file);
    }else{
      dependency = new fileReader.Dependency(file);
    }

    return {error: false, data: {code: code, map: ''}};
  }
}
