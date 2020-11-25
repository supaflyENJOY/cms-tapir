(function(w) {
  var L = function() {
  
  },

  l = L.prototype = {
    _plural: function(n) {
      return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)
    },
    plural: function(num) {
      return arguments[l._plural(num)+1];
    }
  };

  window.Localizer = window.L = new L;
})(window);
