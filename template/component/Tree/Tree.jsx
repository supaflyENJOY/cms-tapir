import {Component} from '../Component.jsx';


var Tree = new Component({
  name: 'Tree',
  ctor: function(cfg) {
    this.createDOM(cfg);
    this.initBinding();

    this.afterInit && this.afterInit();
  },
  prop: {
    value: {type: {name: 'Any'}, default: null},
    tree: {type: Array, default: []}
  },
  createDOM: function(cfg) {
    var val = this.value,
      el = this.dom = <div>Tree</div>;


    this.afterDOM && this.afterDOM();
  },
  initBinding: function() {
    var _self = this;
    debugger
    this.sub([this.value], function (val) {
      //_self.inputEl.value = val;
    });

  }
});

export { Tree };
