import Horizontal from "block/Layout/Horizontal/Horizontal.jsx";
import { Checkbox } from "component/Checkbox/Checkbox.jsx";
import Vertical from "block/Layout/Vertical/Vertical.jsx";
import { Slider } from "component/Slider/Slider.jsx";
import { Select } from "component/Select/Select.jsx";
import { renderProperty, updateSelectableBlocks } from "component/admin/Property/Renderer.jsx";
export default function main(input){

  var select, content, properties, currentPage = new Store.Value.Any(null);
  var pages = new Store.Value.Array([]);
  var dom = <Horizontal class={'main-layout-horizontal'}>
    <Vertical class={'left-side'}>
      <div class={'page-selector'}>
        {select = <Select items={pages} value={currentPage}></Select>}
      </div>
      {content = <div class={'content'}></div>}
    </Vertical>
    {properties = <div class={'properties'}></div>}
  </Horizontal>;


  var randomChars = ()=>Math.random().toString(36).substr(2, 12);
  var communicationHash = randomChars()+randomChars();

  window.document.addEventListener('myCustomEvent', handleEvent, false)
  function handleEvent(e) {
    console.log(e.detail) // outputs: {foo: 'bar'}


  }
  
  var handlers = {
    init: function(data) {
      console.info('Init', data)
    },
    selection: function(data) {
      Ajax.post('/admin/block/get', {name: data.name}, function(err, block) {
        var schema = {}
        if(block.manifest){
          schema = block.manifest.schema;
        }

        debugger
        if(!schema)
          schema = tryToPredictTheSchema(block.manifest);

        D.replaceChildren(properties,
          Object.keys(schema)
            .sort()
            .map(key=>({key, schema: schema[key], value: (data.data && data.data[key]) || block.manifest[key]}))
            .map(renderProperty)
        );
      });

    }
  };
  var eventHandleFn = function(e) {
    var data = e.detail;
    if(data.name){
      handlers[ data.name ]( data.data );
    }
  };

  var tryToPredictTheSchema = function(cfg) {
    var out = {};
    for(var key in cfg){
      var val = cfg[key], type = typeof val;
      if(type === 'string'){
        out[key] = {type: 'String'};
      }else if(type === 'number'){
        out[key] = {type: 'Number'};
      }else if(type === 'object'){
        if(Array.isArray(val)){
          if(val.length && val[0].name){
            out[ key ] = { type: 'Array', of: 'Block'};
          }
        }
      }
    }
    return out;
  };


  currentPage.hook(function(page) {
    if(communicationHash){
      window.document.removeEventListener(communicationHash, eventHandleFn)
    }
    communicationHash = randomChars()+randomChars()

    window.document.addEventListener(communicationHash, eventHandleFn, false)


    var frame = <iframe src={page}></iframe>;
    D.replaceChildren(content, frame );
    frame.addEventListener( "load", function(e) {
      var script = this.contentDocument.createElement('script');
      script.src = '/admin/admin.js?hash='+communicationHash;
      this.contentDocument.head.appendChild(script);
    } );

    Ajax.post('/admin/page/get', {name: page}, function(err, data) {
      var schema = {}
      if(data.manifest){
        schema = data.manifest.schema;
      }

      if(!schema)
        schema = tryToPredictTheSchema(data.manifest);

      D.replaceChildren(properties,
        Object.keys(schema)
          .sort()
          .map(key=>({key, schema: schema[key], value: data.manifest[key]}))
          .map(renderProperty)
        );
    });

  }, true)
  
  Ajax.post('/admin/page/list', {page: 'main'}, function(err, data) {
    select.setItems(data.map(item=>({key:item.path, value: item.page})))
  });
setTimeout(function() {


  Ajax.post('/admin/block/list', {}, function(err, data) {
    updateSelectableBlocks(data.block);
  });
}, 2000)
  return dom;
/*  var val1 = new Store.Value.Boolean(false);

  var x = new Store.Value.Number(44);
  return <Horizontal>
      <b>1</b>
      <b>2</b>
      <Vertical>
        <Checkbox value={true}/>
        <Checkbox value={val1}/>
        <Checkbox value={true}/>
        <Checkbox value={val1}/>
        <Slider from={10} to={100} value={x}/>
      </Vertical>
      <b>4</b>
      <b>5 {T.toFixed(x)}</b>
    </Horizontal>*/
};