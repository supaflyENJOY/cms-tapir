import {Point} from '../../util/Point.jsx';
import {Component} from '../Component.jsx';
import './Slider.scss'

var Slider = new Component({
  ctor: function(cfg) {

    this.createDOM();

    this.initBinding();

    this.initEvents();

    this.afterInit && this.afterInit();

  },
  prop: {
    from: {type: Number},
    to: {type: Number},
    value: {type: Number, default: 0},
    step: {type: Number, optional: true},
  },
  createDOM: function() {
    this.dom = D.div({cls: 'slider'},
      D.div({cls: 'slider-background'}),
      this.zoneEl = D.div({cls: 'slider-zone'}),
      D.div({cls: 'slider-start'},
        D.div({cls: 'slider-start__label'}, T.toFixed(this.from,0) ),
      ),
      D.div({cls: 'slider-end'},
        D.div({cls: 'slider-end__label'}, T.toFixed(this.to, 0) )
      ),
      this.dragEl = D.div({cls: 'slider-drag', style: {left: '0px'}})
    );

    this._updateUI = this._updateUI.bind(this);

    this.afterDOM && this.afterDOM();
  },
  initEvents: function() {
    var _self = this;

    D.mouse.down(this.dom, function(e) {
      var pos = new Point(e.clientX, e.clientY);

      _self.getBound();
      _self.calculateValue(pos);
      _self.updateUI();

      var update = D.AnimationFrame(function(pos) {
        _self.calculateValue(pos);
        _self.updateUI();
      });

      var un = D.mouse.move(document, function(e) {
        e.preventDefault();
        e.stopPropagation();

        pos.x = e.clientX;
        pos.y = e.clientY;

        update(pos);
      }, true);
      D.overlay.show();
      //un.add( D.mouse.up(_self.dom, un) );
      un.add(function() {
        D.overlay.hide();
      });
      un.add( D.mouse.up(window, un) );
    });
  },
  getBound: function() {
    var bound = this.zoneEl.getBoundingClientRect();
    this.bound = {
      left: bound.left,
      top: bound.top,
      height: bound.height,
      width: bound.width
    };
  },
  calculateValue: function(pos) {
    var bound = this.bound;
    var val = Math.min(Math.max(0, pos.x-bound.left), bound.width);
    this.setValue(this.from.get()+(val/bound.width*(this.delta)));
  },
  afterAddToDOM: function() {
    this.getBound();
    this.updateUI();
  },
  bound: null,
  _updateRequested: false,
  _updateUI: function() {
    this._updateRequested = false;
    this.dragEl.style.left = (this.value.get()-this.from.get())/(this.delta)*this.bound.width+'px';
  },
  updateUI: function() {
    if(this.bound){
      if(!this._updateRequested){
        this._updateRequested = true;
        requestAnimationFrame(this._updateUI)
      }
    }
  },
  initBinding: function() {
    var _self = this;

    this.sub([this.value, this.from, this.to], function (val, from, to) {
      _self.delta = to - from;
      _self.setValue(val);
      _self.updateUI();
    });

  },
  lastValue: null,
  setValue: function(val, silent) {
    var inVal = val;
    val = Math.min(this.to.get(), Math.max(this.from.get(), val));
    if('step' in this){
      var step = this.step.get();
      val = Math.round(val/step)*step;
    }
    if(val !== this.lastValue || inVal !== val){
      this.lastValue = val;
      if(!silent) this.value.set(val);
    }
  }
});

export { Slider };