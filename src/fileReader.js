const fs = require( 'fs' ),
  path = require('path'),
  Dir = require('../dir.js');

const fileCache = {};
let root = module;
while(root.parent)
  root = root.parent;

const CACHE_ENABLED = !process.env.DISABLE_CACHE;
let rootPath = root.path;

const M = module.exports = {
  Dependency: function(file) {
    this.files = [];
    var filePath = file instanceof Dir.File ? file.path : file;
    if(filePath)
      this.files.push(filePath);
  },
  read: async function(file, encoding = 'utf-8') {

    //filePath = M.normalizePath(filePath);
    var filePath = file instanceof Dir.File ? file.path : file;

    if(CACHE_ENABLED) {
      if( filePath in fileCache )
        if( encoding in fileCache[ filePath ] )
          return

      if( fileCache[ filePath ] instanceof Promise )
        return fileCache[ filePath ];
    }
    if(file === null)
      debugger

    fileCache[filePath] = new Promise(function(resolve, reject) {
      M.watch(file);
      fs.stat(filePath, function(err, data) {
        if(err){
          fileCache[filePath] = {error: new Error(err.message)};
          return reject( fileCache[filePath].error );
        }
        fs.readFile(filePath, function(err, data) {
          if(err){
            fileCache[filePath] = {error: new Error(err.message)};
            return reject( fileCache[filePath].error );
          }

          fileCache[filePath] = {error: false, data: data.toString(encoding)}
          resolve(fileCache[filePath].data);
        });
      });

    });

    return fileCache[filePath];
  },
  normalizePath: function(thePath) {
    var parsed;
    if(thePath instanceof Dir.File){
      parsed = path.parse(path.join(thePath.dir.path));
    }else{
      parsed = path.parse(path.relative(rootPath, thePath))
    }

    return path.posix.join(parsed.dir.split(/[\\\/]/).join(path.posix.sep), parsed.base);
  },
  _watches: {},
  watch: function(file) {
    var dir = file.dir.path;
    //const parsed = path.parse(M.normalizePath(filePath));//,
      //tokens = parsed.dir.split(/[\\\/]/).filter(String);
    if(dir){
      if(!(dir in M._watches)){
        var watch = require('./WSL-watch');
        console.log('watch', dir)
        M._watches[dir] = watch(dir, function(filename){
          M.clearFileCache(filename);
        });
      }
    }


  },
  _waitForCacheClear: {},
  _waitingForCacheClear: null,
  _clearFileCache: function() {
    M._waitingForCacheClear = null;

    for(var file in M._waitForCacheClear){
      if( file in fileUsageInDependencyCache ){
        var usedInCache = fileUsageInDependencyCache[file];
        for(var cacheString in usedInCache){
          cacheString.split('*').forEach((name)=>M.fire('update', name));
          delete dependencyCache[cacheString];
        }
        delete fileUsageInDependencyCache[file];
      }
      delete fileCache[ file ];
    }
    M._waitForCacheClear = {};
  },
  clearFileCache: function(fileName) {
    var file = M.normalizePath(fileName);

    M.fire('update', file);

    M._waitForCacheClear[file] = true;
    if(!M._waitingForCacheClear)
      M._waitingForCacheClear = setTimeout(M._clearFileCache, 100);
  }
}
var Observer = require('./core/Observer.js');
Object.assign(M, Observer.prototype);
Observer.call(M);


const dependencyCache = {},
  fileUsageInDependencyCache = {};


M.Dependency.prototype = {
  read: async function(file, encoding = 'utf-8') {
    var filePath = file instanceof Dir.File ? file.path : file;
    //filePath = M.normalizePath(filePath);
    this.files.push(file);

    return await M.read(file, encoding);
  },
  result: async function(fn) {
    const filesToken = this.files.sort().join('*');
    if(filesToken in dependencyCache){
      const cached = dependencyCache[filesToken];
      if(cached instanceof Promise)
        return cached;
      if(cached.error)
        throw cached.error;

      return cached.result;
    }


    let result;
    try{
      result = await fn();
    }catch(e){
      dependencyCache[filesToken] = {error: new Error(e.message)};

      throw dependencyCache[filesToken].error;
    }finally{
      for( var i = 0, _i = this.files.length; i < _i; i++ ){
        var file = this.files[ i ];
        (fileUsageInDependencyCache[file] || (fileUsageInDependencyCache[file] = {}))[filesToken] = true;
      }

    }
    dependencyCache[filesToken] = {error: false, result};
    return result;
  }
};