import {Component} from '../Component.jsx';

var Checkbox = new Component({
  ctor: function(cfg) {
    this.createDOM();
    this.initBinding();

    this.afterInit && this.afterInit();
  },
  prop: {
    value: {type: Boolean, default: false}
  },
  createDOM: function() {
    var val = this.value,
        el = this.dom = this.inputEl = D.h('input', {
          attr: {type: 'checkbox'},
          cls: 'picker-button__field',
          onchange: function() {
            val.set(el.checked);
          }
        });

    this.afterDOM && this.afterDOM();
  },
  initBinding: function() {
    var _self = this;

    this.sub([this.value], function (val) {
      console.log(val)
      _self.inputEl.checked = !!val;
    });

  }
});

export { Checkbox };