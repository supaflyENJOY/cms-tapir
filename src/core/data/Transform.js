var Transform = (function() {
  'use strict';

  var hookAndConvert = function(fn) {
    return function(hook, a) {
      var type = typeof hook;
      var notObject = type !== 'object';
      var isHook = !notObject && ('hook' in hook);
      if(isHook){
        type = 'function'; notObject = true;
      }
      if(notObject){
        if( type === 'function' ){
          var last, val;
          if(isHook){
            return {hook: function(draw) {
              return hook.hook(function(arg) {
                val = fn(arg, a);
                if(last === val)
                  return;

                return draw(last = val);
              });
            }};
          }else{
            return function(draw) {
              return hook(function(arg) {
                val = fn(arg, a);
                if(last === val)
                  return;

                return draw(last = val);
              });
            };
          }
        }
      }else{
        return hook;
      }
    }
  };
  var Transform = {
    toFixed: hookAndConvert(function(val, digits) {
      return (val-0).toFixed(digits);
    })
  };

  return Transform;
})();

typeof module === 'object' && (module.exports = Transform);
(typeof window === 'object') && (window.T = window.Transform = Transform);