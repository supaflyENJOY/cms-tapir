require('dotenv').config();
const fs = require( 'fs' ),
  path = require('path'),
  util = require('util'),
  JSON5 = require('json5'),

  env = process.env,
  compression = require('compression'),
  HOST = env.HOST || '0.0.0.0',
  PORT = env.PORT || 7373,
  App = require('express'),
  app = App(),
  {execSync} = require('child_process');

require('./util.js');
global.Observable = require('./src/core/Observer.js');
process
  .on('unhandledRejection', (reason, p) => {
    debugger
    console.error(reason, 'Unhandled Rejection at Promise', p);
    fs.appendFileSync(path.join(__dirname,'tmp/log'), new Date().toISOString()+'\n'+reason+'\n\n');
  })
  .on('uncaughtException', (err, p) => {
    debugger
    console.error(err, 'Unhandled Rejection at Promise', p);

    fs.appendFileSync(path.join(__dirname,'tmp/log'), new Date().toISOString()+'\n'+err.stack+'\n\n');
  });

app.disable('x-powered-by');

const dir = global.dir = function(...args) {
  return path.join.apply(path, [__dirname, ...args]);
};

let appScope = {env: {}};

let commit, commitNUMBER, lastUpdateNumber;
const updateCommitInfo = function() {
  try{
    commit = execSync( 'git rev-parse HEAD' ).toString().trim();
    if( !lastUpdateNumber || lastUpdateNumber + 45000 < +new Date() ){
      lastUpdateNumber = +new Date()
      commitNUMBER = execSync( 'git rev-list --count HEAD' ).toString().trim();
      appScope.env.commit = commitNUMBER;
    }
  }catch(e){
    console.error('This project is not a git repository')
  }
};
updateCommitInfo();

const R = new App.Router,
  Tapir = require('api-tapir'),
  api = new Tapir({
    timeout: 6666,
    router: R,
    docs: 'GET:/api'
  });

var config = global.config = require('./config/config.js');

var route = require('./config/route.js');

//var simpleTransformToAMD = require('./pack/babel-plugin-transform-2015es-to-amd')
const useSourceMaps = env.LAMUR_ENV === 'DEVELOP';

var jsx = require('./src/transform/jsx.js');

var cache = {};
var lives = [];
var log = [];

var fileReader = require('./src/fileReader.js');

var paths = {};

var serveScss = require('./src/serve/scss.js');
serveScss.setCache(cache);
jsx.setCache(cache);
app.use('/template', async function(req, res, next){
  var fileName = req.originalUrl;
  var ext = '.'+fileName.split('.').pop();

  if(ext === '.scss'){
    await serveScss.serve(fileName, req, res, next)

  }else{
    next();
  }
});
var generateServe = function(pathName, useConfig) {
  return async function(req, res, next){
    if(req.originalUrl.match(/\.scss?$/)!==null){
      return await serveScss.serve('template/'+req.originalUrl, req, res, next)
    }

    var dependency = new fileReader.Dependency(),
      blockName = req.originalUrl.substr( ('/'+pathName).length + 1 );// args.name;


    var blockPath = `./template/${pathName}/${blockName}`,
      blockCode = await dependency.read( blockPath ),
      config = {},
      configPath = blockPath.replace(/\.jsx?$/, '.json5');
    if(useConfig){
      try{
        config = JSON5.parse( await dependency.read( configPath ) );
      }catch( e ){

      }
    }
    try{
      var result = await dependency.result( async function(){

        var code = await jsx.transformJSX(
          (

(useConfig?`const blockConfig = new Store(${JSON.stringify( config )}).bindings(), inheritConfig = (a)=>Object.assign({}, blockConfig, a);`:'')+
`${blockCode.trim().indexOf( '<' ) === 0 ?
            `var declaration = D.declare("${pathName}/${blockName}", function(input){
${useConfig?`input = inheritConfig(input);`:''}return (<>
              
              
${blockCode}


</>);});export default declaration;` : blockCode
          }` ),

          `${pathName}/${blockName}`,

          dependency,
          blockPath
        );

        return code.code;

      } );

      cache[ req.url + '.map' ] = JSON.stringify( result.map );
      res.set( 'SourceMap', req.url + '.map' );
      res.set( 'Content-type', 'application/javascript; charset=UTF-8' );

      res.end(result)
    }catch( e ){
      res.end(JSON.stringify({error: true, data:e.message}));
      /*debugger
      next();*/
    }
  };
}
app.use('/block', generateServe('block'));
app.use('/component', generateServe('component'));
app.use('/util', generateServe('util'));
for(var key in route){
  let currentRoute = route[key];
  paths['GET:'+key] = {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    },
    description: `Page ${key}`,
    fn: async function() {

      var dependency = new fileReader.Dependency();

      var cmsPage = await dependency.read('./src/cms.html'),
        pageCode = await dependency.read(`./template/page/${currentRoute.page}.jsx`),

        config = {};

      try{
        config = JSON5.parse(await dependency.read( `./template/page/${currentRoute.page}.json5` ));
      }catch( e ){

      }

      return await dependency.result(async function() {
        var code = await jsx.transformJSX(
          pageCode.indexOf('export '>-1)?
            pageCode :
            `export default ${pageCode.trim().indexOf('<') !== 0 ? pageCode :
              `(input)=>{return <>${pageCode}</>}`
            }`,

          `page/${currentRoute.page}.jsx`,

          dependency,
          `template/page/${currentRoute.page}.jsx`
        );

        var inputs = Object.assign({}, appScope, {
          pageCode: code.code+`
    define('start', ['page/${currentRoute.page}.jsx'], function(main) {
      D.appendChild(document.body, main.default(
        new Store(${JSON.stringify(config)}).bindings()
      ))
    });`
        });
        var finalHTML = cmsPage;
        for(var key in inputs){
          finalHTML = finalHTML.replace(new RegExp('%'+key.toUpperCase()+'%', 'g'), typeof inputs[key] === 'object' ? JSON.stringify(inputs[key]): inputs[key])
        }

        return finalHTML;

      });
    }
  };
}
api(paths);//{'GET:/': {fn: ()=>2}})
//app.use(compression());

app.use(R);
config.static.forEach(dirName => app.use(App.static(dir(dirName))));

app.use('/', function(req, res, next){
  //console.log( req.originalUrl )

  if( req.originalUrl === '/[live]' ){
    lives.push( res );
  }else if( req.originalUrl === '/log' ){
    if(req.method === 'GET'){
      res.end(JSON.stringify(log))
    }else{
      log.push( req.body );
      res.end('OK')
    }

  }else if( req.originalUrl in cache ){
    res.end( cache[ req.originalUrl ] );
  }else{
    next();
  }
});
var debounce = {}, shouldUpdate = false;
var Store = require('./src/core/data/store/Store.js');

var doUpdate = Store.debounce(async function(){

  var files = [];
  for( let filename in debounce ){
    try{
      if(filename.substr(-4)==='.jsx'){

        var req = {url: '/'+path.posix.relative(config.template, filename)}
        debugger

        var dependency = new fileReader.Dependency(),
          blockName = req.url.substr( '/block'.length + 1 );// args.name;


        var blockPath = `./template/block/${blockName}`,
          blockCode = await dependency.read( blockPath ),
          blockConfig = {},
          configPath = blockPath.replace( /\.jsx?$/, '.json5' );

        try{
          blockConfig = JSON5.parse( await dependency.read( configPath ) );
        }catch( e ){

        }
var map;
        var result = await dependency.result( async function(){

          var code = await jsx.transformJSX(
            ( `const blockConfig = new Store(${JSON.stringify( blockConfig )}).bindings(), inheritConfig = (a)=>Object.assign({}, blockConfig, a);
${blockCode.trim().indexOf( '<' ) === 0 ?
              `var declaration = D.declare("block/${blockName}", function(input){
input = inheritConfig(input); return (<>
              
              
${blockCode}


</>);});export default declaration;` : blockCode
            }` ),

            `block/${blockName}`,

            dependency,
            blockPath
          );
          map = code.map;
          return code.code;

        } );

        cache[ req.url + '.map' ] = JSON.stringify( map );


        var url = '/' + path.relative( './'+config.template, filename ).replace( /\\/g, '/' )

        console.log( 'Live transform jsx ', url )
        files.push( { file: url, content: result } );
        //}
        /*else if(filename.substr(-3)==='.js'){
      var code = await readFile( filename ) + '';
      var url = '/' + path.relative( './src', filename ).replace( /\\/g, '/' )
      console.log( 'Live transform js ', url )
      var result = await transformJSPromised( code, url );
      files.push( { file: url, content: result.code } );
    }*/
      }
    }catch( e ){

      console.log( 'Error in ' + e );
    }
    delete debounce[filename];

  }
  var live, liveUpdate = JSON.stringify(files);
  while((live = lives.pop()))
    live.end(liveUpdate);
  shouldUpdate = false;
}, 100);

fileReader.on('update', function(name) {
  debounce[name] = true;
  doUpdate();
});

app.listen(PORT, HOST);

console.log(`Tapir-CMS ENV: ${env.ENV}`);
console.log(`Tapir-CMS LISTEN: http://${HOST}:${PORT}`);
