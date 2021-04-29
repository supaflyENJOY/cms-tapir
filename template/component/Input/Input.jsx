import {Component} from '/component/Component.jsx';


var Input = new Component({
  name: 'Input',
  ctor: function(cfg) {
    this.createDOM(cfg);
    this.initBinding();

    this.afterInit && this.afterInit();
  },
  prop: {
    value: {type: String, default: ''},
    multiline: {type: Boolean, default: false}
  },
  createDOM: function(cfg) {
    var val = this.value,
      el = this.dom = this.inputEl = D.h(this.multiline.get()?'textarea':'input', {
        placeholder: cfg.placeholder,
        style: cfg.style,
        attr: {type: 'text'},
        cls: D.cls('cmp-input', cfg.class),
        oninput: function() {
          val.set(el.value);
        }
      });


    this.afterDOM && this.afterDOM();
  },
  initBinding: function() {
    var _self = this;

    this.sub([this.value], function (val) {
      _self.inputEl.value = val;
    });

  }
});

export { Input };
