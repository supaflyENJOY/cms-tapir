var sqrt = Math.sqrt;
var abs = Math.abs || function(n){return n>0 ? n: -n}
var Point = function( x, y ){
  if(arguments.length === 0){
    x = 0;
    y = 0;
  }
  if(x instanceof Point || x.hasOwnProperty('x')) {
    y = x.y;
    x = x.x;
  }
  this.x = x;
  this.y = y;
};

Point.prototype = {
  add: null, addClone: null,
  sub: null, subClone: null,
  mul: null, mulClone: null,
  div: null, divClone: null,
  mod: null, modClone: null,

  passable: true,
  borrow: function(from) {
    this.x = from.x;
    this.y = from.y;
    return this;
  },
  join: function(symbol) {
    return this.x+symbol+this.y;
  },
  set: function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  middle: function(point) {
    return new Point((this.x+point.x)/2, (this.y+point.y)/2)
  },
  clone: function(){
    return new Point( this.x, this.y );
  },
  distance: function( obj ){
    var tmp;
    return sqrt( (tmp = this.x - obj.x) * tmp + (tmp = this.y - obj.y) * tmp );
  },
  distancePow2: function( obj ){

    var tmp;

    return (tmp = this.x - obj.x) * tmp + (tmp = this.y - obj.y) * tmp;
  },
  manhattan: function( obj ){
    return abs(this.x - obj.x) + abs(this.y - obj.y);
  },
  magnitude: function() {
    return sqrt(this.x*this.x+this.y*this.y);
  },
  rotate: function(angleRAD) {
    var angle = Math.atan2(this.y, this.x) + angleRAD;
    var length = this.magnitude();
    return new Point(Math.cos(angle)*length,Math.sin(angle)*length)
  },
  getAngle: function(p) {
    if(p)
      return Math.atan2(p.y - this.y, p.x - this.x);
    else
      return Math.atan2(this.y, this.x);
  },
  toString: function(fixed) {
    fixed === void 0 && (fixed = 3);
    return 'x:'+this.x.toFixed(fixed)+' y:'+this.y.toFixed(fixed);
  },
  normalize: function() {
    return this.div(this.magnitude())
  },
  projection: function(to) {
    var angle = this.getAngle()-to.getAngle();
    return to.clone().normalize().mul(this.magnitude()*Math.cos(angle));
  },
  lerp: function(to, amount) {
    return new Point(this.x+(to.x-this.x)*amount,this.y+(to.y-this.y)*amount)
  },
  clamp: function(n) {
    return new Point((n/2%1)+(this.x|0), (n/2%1)+(this.y|0));
  }
};
Point.prototype.getter = Point.prototype.clone;
[
  {
    name: 'add',
    sign: '+'
  },
  {
    name: 'sub',
    sign: '-'
  },
  {
    name: 'mul',
    sign: '*'
  },
  {
    name: 'div',
    sign: '/'
  },
  {
    name: 'mod',
    sign: '%'
  }
].forEach(function( el ){
  var sign = el.sign;
  Point.prototype[ el.name ] = Function( 'objOrX, y', [
    'if( y === void 0 ){',
    '    if( typeof objOrX === \'number\' ){',
    '        this.x '+ sign +'= objOrX;',
    '        this.y '+ sign +'= objOrX;',
    '    }else{',
    '        this.x '+ sign +'= objOrX.x;',
    '        this.y '+ sign +'= objOrX.y;',
    '    }',
    '}else{',
    '    this.x '+ sign +'= objOrX;',
    '    this.y '+ sign +'= y;',
    '}',
    'return this;'
  ].join('\n') );
  Point.prototype[ el.name +'Clone'] = Function( 'objOrX, y',
    'return this.clone().'+el.name+'(objOrX, y);'
  )
});

export {Point};