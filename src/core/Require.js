//
let self = window;
self.fetch||(self.fetch=function(e,n){return n=n||{},new Promise(function(t,s){var r=new XMLHttpRequest,o=[],u=[],i={},a=function(){return{ok:2==(r.status/100|0),statusText:r.statusText,status:r.status,url:r.responseURL,text:function(){return Promise.resolve(r.responseText)},json:function(){return Promise.resolve(JSON.parse(r.responseText))},blob:function(){return Promise.resolve(new Blob([r.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var c in r.open(n.method||"get",e,!0),r.onload=function(){r.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t}),t(a())},r.onerror=s,r.withCredentials="include"==n.credentials,n.headers)r.setRequestHeader(c,n.headers[c]);r.send(n.body||null)})});

var ansispan = function (str) {
  Object.keys(ansispan.foregroundColors).forEach(function (ansi) {
    var span = '<span style="color: ' + ansispan.foregroundColors[ansi] + '">';
    str = str.replace(
      new RegExp(String.fromCharCode(27)+'\\[' + ansi + 'm', 'g'),
      span
    ).replace(
      new RegExp( String.fromCharCode( 33 ) +'\\[0;' + ansi + 'm', 'g'),
      span
    );
  });
  str = str.replace(/\033\[1m/g, '<b>').replace(/\033\[22m/g, '</b>');
  str = str.replace(/\033\[3m/g, '<i>').replace(/\033\[23m/g, '</i>');

  str = str.replace(/\033\[m/g, '</span>');
  str = str.replace(/\033\[0m/g, '</span>');
  return str.replace(/\033\[39m/g, '</span>')
    .replace(/\[90m/g, '  ');
};

ansispan.foregroundColors = {
  '30': 'black',
  '31': 'red',
  '32': 'green',
  '33': 'yellow',
  '34': 'blue',
  '35': 'purple',
  '36': 'cyan',
  '37': 'white'
};

;(function(Path){
  'use strict';


  var log = console.log;
  /*var log = function() {
    console.log.apply(console, ['Define'].concat([].slice.call(arguments)));
  };*/


  if(window.env.ENV !== 'PRODUCTION'){
    window.onerror = function( message, source, lineno, colno, error ){
      var dataEl;

      fetch( source.indexOf('block/')>-1 ? source + '' : source, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      } )
        .then( function( resp ){
          return resp.text();
        } )
        .then( function( response ){
          //if( data.match( /^(unknown|Error|SyntaxError|error)/ ) !== null ){
          var data = JSON.parse(response);

            var urla = source.substr( document.location.origin.length );
            urla[ 0 ] === '/' && ( urla = urla.substr( 1 ) );
            if( define.waiting[ urla ] ){
              define( urla, ['exports'], function(_exports){
                _exports.default = function(){
                  var erDiv = D.div( { cls: 'error-block', style: `
    white-space: pre-wrap;
    font-family: monospace;
    background: rgb(109 33 4);
    color: rgb(255, 255, 255);
    padding: 4px 8px;
    position: relative;
    border: 8px solid;
    border-image-source: linear-gradient(to left, #e25604, #c10d0d);
    border-image-slice: 1;
                  ` },
                    D.input( {
                      style: `
    position: absolute;
    right: 8px;
    top: 8px;
    border: 0;
    padding: 4px 8px;
    border-radius: 4px;`,
                      attr: { type: 'button', value: 'Hide' }, on: {
                        click: function(){
                          erDiv.parentNode.removeChild( erDiv );
                        }
                      }
                    } ) )
                  dataEl = D.div();
                  erDiv.appendChild( dataEl )
                  dataEl.innerHTML = ansispan( data.data )


                  return erDiv;
                }
              } );

              console.error( 'LOADER: сделаем вид что ', '`' + source.substr( document.location.origin.length ) + '`', 'загрузилось, но вообще — нет. Его поджидали:', define.waiting[ urla ] );
              console.error( source, message, error );
            }

          //}
        } )
        .catch();


    };
  }

  var head = document.getElementsByTagName( 'head' )[ 0 ];
  window.allLoaded = {css: {}, js: {}, jsList: [], cssList: []}
  var cssLoader = function( fileName ){
    var link = document.createElement( 'link' );
    link.setAttribute( 'rel', 'stylesheet' );
    link.setAttribute( 'type', 'text/css' );
    link.setAttribute( 'href', fileName );
    head.appendChild( link );
    if(!window.allLoaded.css[fileName]){
      window.allLoaded.css[ fileName ] = true;
      window.allLoaded.cssList.push( fileName );
    }

    return true;
  };
  window.preloaded = {};
  var jsLoader = function( fileName ){
    if(fileName in preloaded){
      eval(preloaded[fileName]);
    }else{
      var script = document.createElement( 'script' );
      script.setAttribute( 'type', script.type = 'text/javascript' );
      script.onload = function( a, b, c ){

      };

      script.onerror = function( a, b, c ){
        if( fileName.indexOf( 'Fields' ) > -1 ) debugger
        console.log( 'kkk', a, b, c )
      };
      script.setAttribute( 'src', script.src = '/' + fileName );
      head.appendChild( script );
    }
    if(!window.allLoaded.js[fileName]){
      window.allLoaded.js[ fileName ] = true;
      window.allLoaded.jsList.push( fileName );
    }
  };

  var InstantLoaders = [
    { name: '.scss', loader: cssLoader },
    { name: '.css', loader: cssLoader },
    { name: '.jsx', loader: jsLoader },
    { name: '.js', loader: jsLoader },
    { name: '.tsx', loader: jsLoader },
    { name: '.ts', loader: jsLoader },
    { name: '.svg', loader: jsLoader },
  ];

  var definitions = {};
  var waiting = {};

  var resolve = function(base, file) {
    if(file[0] !== '.' && file[0] !== '/')file = '/'+file;
    return Path.resolve(Path.dirname(base), file);
  };
  var _define = function(name) {
    var definition = definitions[name];
    if(definition.notResolved === 0){
      definition.fn.apply(null, definition.deps.map(function(dep) {
        return dep === 'exports' ? definition.exports : definitions[dep].exports
      }));

      (waiting[definition.fileName] || []).forEach(function(name) {
        definitions[name].notResolved--;
        _define(name)
      });
    }
  };
  window.define = function(fileName, deps, fn) {

    fileName = Path.trim(fileName);
    deps = deps.map(function(dep) {
      return dep === 'exports' ? 'exports': resolve(fileName, dep);
    });

    if(!(fileName in definitions) || definitions[fileName].notResolved !== 0){
      window.define.list.push(fileName);
      definitions[ fileName ] = { fileName: fileName, deps: deps, fn: fn, exports: {} };

      var notResolved = 0;
      for( var i = 0, _i = deps.length; i < _i; i++ ){
        const dep = deps[ i ];
        if( dep === 'exports' )
          continue;
        var skip = false;
        if( !( dep in definitions ) ){
          var matched = false;
          for( var j = 0, _j = InstantLoaders.length; j < _j; j++ ){
            const instantLoader = InstantLoaders[ j ];
            if( dep.substr( -instantLoader.name.length ).toLowerCase() === instantLoader.name ){
              if( !( dep in definitions ) ){
                definitions[ dep ] = { exports: {} };
                if( instantLoader.loader( dep ) ){
                  skip = true;
                  definitions[ dep ].notResolved = 0;
                }else{
                  definitions[ dep ].loading = true;
                }
                matched = true;
              }
              break;
            }
          }
          if(!matched){
            if( !( dep in definitions ) ){
              definitions[ dep ] = { exports: {} };
              if( jsLoader( dep ) ){
                skip = true;
              }else{
                definitions[ dep ].loading = true;
              }
              matched = true;
            }
          }

        }else{
          skip = definitions[ dep ].notResolved === 0;
        }
        if( !skip ){
          ( waiting[ dep ] || ( waiting[ dep ] = [] ) ).push( fileName );
          notResolved++;
        }
      }
      definitions[ fileName ].notResolved = notResolved;
    }else{
      definitions[ fileName ].fn = fn;
    }
    _define(fileName)
  };
  window.define.list = [];
  window.define.definitions = definitions;
  window.define.waiting = waiting;

  var tmpArea = document.createElement("textarea");
  function decodeHtml(html) {
    tmpArea.innerHTML = html;
    return tmpArea.value;
  }

  var rH = window.RenderHTML = function(data) {
    if(typeof data !== 'object'){
      return decodeHtml(data);
    }
    if('get' in data && typeof data.get === 'function'){
      var arr = data.get();
    }else{
      var arr = data;
    }
    return arr.map(el=>Array.isArray(el) ? D.h.apply(D, el.slice(0,2).concat( el.slice(2).map(subEl=> Array.isArray(subEl)?rH([subEl]): rH(subEl))  )): decodeHtml(el));
  };
  window.RenderBlocks = function(blocks, callback) {
    if(blocks === void 0 || blocks === null){
      blocks = [];
    }else if(blocks.name){
      blocks = [blocks];
    }else if(Array.isArray(blocks)){

    }else{
      blocks = blocks.array();
    }
    var uid = 0;
    var resolved = [];
    return function(draw) {
      draw(blocks.map(function(block) {
        return function(drawSubBlock) {
          var subUid = uid;
          uid++;
          define(Math.random()+'_'+block.name, ['block/'+block.name+'.jsx'], function(blockModule) {

            // rendered block

            var something;
            //try{
              something = new blockModule.default( new BlockNamespace( block ) );
            /*}catch( e ){
              something = e.message;
            }*/
            drawSubBlock(something);
            resolved[subUid] = something || true;
            for(var i = 0, _i = blocks.length; i < _i; i++){
              if(!resolved[i])
                return;
            }
            callback && callback(resolved);
          });
        }
      }));
    }
  }
  window.inheritConfig = function(a) {
    return a;
  }
  var namedBindings;
  window.BlockNamespace = function(block) {
    if(!namedBindings) namedBindings = new Store({});

    var bindings = new Store(block.data || {}).bindings();
    if(block.id){
      debugger
      namedBindings.set(block.id, bindings);
      console.log(namedBindings)
    }


    return bindings;
  }

  window.ConfigInheriter = function(blockConfig) {
    return function (a){
      console.log(blockConfig)
      return Object.assign({}, blockConfig , a);
    }
  }
})(window.__Path);