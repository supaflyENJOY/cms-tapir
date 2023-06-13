(function(w) {
  var LFunc = function Localize(str){
    L._localized++;
    var result = str.split('.').reduce(function(store, part){
      if(!(part in store)){
        console.error(`No localization for ${str}`)
      }
      return store[part];
    }, L.currentLocale);
    if(typeof result === 'function')
      result = result(arguments[1]);
    return result;
  };

  var L = {
    _localized: 0,
    lower: function(){
      return (LFunc.apply(L, arguments)+'').toLowerCase();
    },
    upper: function(){
      return (LFunc.apply(L, arguments)+'').toUpperCase();
    },
    BigWords: function(){
      var res = (LFunc.apply(L, arguments)+'').toLowerCase();
      return res.split(' ').map(a=>a[0].toUpperCase() + a.substr(1)).join(' ');
    },
    firstBig: function(){
      var a = (LFunc.apply(L, arguments)+'').toLowerCase();
      return a[0].toUpperCase() + a.substr(1);
    },

    currentLocale: false,
    LOCALE: {},
    init: function(localeName, cfg){
      if(L.currentLocale === false)
        L.currentLocale = cfg;

      L.LOCALE[localeName] = cfg;
      cfg._localeName = localeName;
    },
    _plural: function(n) {
      return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)
    },
    plural: function(num) {
      return arguments[L.currentLocale._plural(num)+1];
    }
  };

  L = Object.assign(LFunc, L);
  window.Localizer = window.L = L;
})(window);
