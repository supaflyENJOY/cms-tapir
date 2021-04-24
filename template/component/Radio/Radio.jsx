import {Component} from '../Component.jsx';

/*
Radio component has it's own value property and group property.
When you change group property (outside of component) — corresponding radio would be selected.
 */
var Radio = new Component({
  ctor: function(cfg) {
    this.createDOM();
    this.initBinding();

    this.afterInit && this.afterInit();
  },
  prop: {
    value: {type: Component.Property.Any, default: false},
    group: {type: Component.Property.Any, default: false}
  },
  createDOM: function() {
    var val = this.value,
      group = this.group,
        el = this.dom = this.inputEl = D.h('input', {
          attr: {type: 'radio'},
          cls: 'picker-button__field',
          onchange: function() {
            if(el.checked){
              group.set(val.get())
            }
          }
        });

    this.afterDOM && this.afterDOM();
  },
  initBinding: function() {
    var _self = this;

    this.sub([this.value, this.group], function (val, group) {
      _self.inputEl.checked = val === group;
    });
  }
});


export { Radio };
/*
let RadioGroup = function(cfg) {
  this.radios = [];
  this.bind = cfg.bind;
  if(!cfg.bind){
    console.error('CMP: radioButtonGroup is not binded to value');
  }else{
    this.bind.sub(val=>this.radios.forEach(r=>r.input.checked = r.value===val));
  }
  this.Radio = this.Radio.bind(this);
};
RadioGroup.prototype = {
  Radio: function(cfg) {
    let input = <input type="radio" onChange={()=>{
      input.checked && this.bind.set(cfg.value)
    }} className="picker-button__field" name={"ifadmin"}/>;


    input.checked = this.bind.get()===cfg.value;
    this.radios.push({input, value: cfg.value});
    return <label className="picker-button">
      {input}
      <span className="picker-button__indicator"/>
      <span className="picker-button__desc">{cfg.label}</span>
    </label>;
  }
};*/
