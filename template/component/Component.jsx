const slice = [].slice;
const Component = function(cfg) {

  var original = cfg;
  var _ctor = function(cfg, children){
    if(!(this instanceof _ctor)){
      return new _ctor(cfg, children);
    }

    this.store = new Store();
    this._apply(cfg);
    arguments.length > 1 && this._children.call(this, slice.call(arguments, 1));
    this.__un = new D.Unsubscribe();

    original.ctor && original.ctor.call(this, cfg);
  };

  _ctor.prototype = Object.assign(Object.create(Component.prototype), cfg);
  _ctor.constructor = _ctor;
  return _ctor;
};

Component.prototype = {
  prop: {},
  _children: function(children) {
    this.children = children;
  },
  _apply: function(cfg) {
    cfg = cfg || {};
    var prop = this.prop;
    for(var key in cfg){
      var val = cfg[key];
      if(key in prop){
        if(val instanceof Store.StoreBinding || val instanceof Store.HookPrototype){
          this[key] = val;
        }else{
          this[key] = new Store.Value[prop[key].type.name](val);
        }
      }else{
        this[key] = val;
      }
    }
    for(key in prop){
      if(!(key in cfg)){
        console.info(key,'property is not specified in', this);
        var property = prop[key];

        if(!property.optional){
          this[ key ] = new Store.Value[ property.type.name ]();
          if(property.default){
            this[ key ].set( property.default );
          }
        }
      }
    }
  },
  '~destroy': function() {

    // TODO: destroy props

    var pointer = this.dom.parentNode;
    if(!pointer){
      pointer = this.dom;
    }
    var allHooked = [].slice.call(pointer.querySelectorAll('[data-hooked]'));
    for( var i = 0, _i = allHooked.length; i < _i; i++ ){
      var un = allHooked[ i ].__un;
      if(!un)
        continue;

      var uns = allHooked[ i ].__un;
      for( var j = 0, _j = uns.length; j < _j; j++ ){
        var unSubscribe = uns[ j ];
        unSubscribe();
      }

      delete allHooked[ i ].__un;
    }

    if(this.dom.parentNode){
      pointer.removeChild( this.dom );
    }

    this.dom = void 0;

    this.__un.un();

    for(var key in this)
      this.hasOwnProperty(key) && delete this[key];
  },
  sub: function() {
    var un = this.store.sub.apply(this.store, arguments);
    this.__un.add(un);
  }
};
var Property = function(type) {
  this.name = type;
};
Property.prototype = {
  set: function(val) {
    return val;
  },
  get: function(val) {
    return val;
  },
  compare: function(val1, val2) {
    return val1 === val2;
  }
};
Component.Property = {
  Any: new Property('Any')
};
export { Component };