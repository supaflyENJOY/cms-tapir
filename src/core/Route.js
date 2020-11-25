var Route = function(url) {
  if(!(this instanceof Route))
    return new Route(url);

  //url.replace(/(:[a-zA-Z0-9\-_]+)(?=\/|$)/g)
  var list = this.list = [];

  var rand = Math.random().toString(36).substr(2);

  this.splitted = url.replace(/(:([^\/]+))(?=\/|$)/g, function(str, full, token) {
    list.push(token);
    return rand;
  }).split(rand);

  var splitted = this.splitted,
    out = [];

  for( var i = 0, _i = splitted.length; i < _i; i++ ){
    out.push(splitted[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    i<_i-1 && out.push('([^\\/]+)');
  }

  this.RegExp = new RegExp('^'+out.join('')+'/?$', 'i');
};
Route.prototype = {
  generate: function(data) {
    var list = this.list,
      splitted = this.splitted,
      out = [];

    for( var i = 0, _i = splitted.length; i < _i; i++ ){
      out.push(splitted[i]);
      i<_i-1 && out.push(data[list[i]] || '');
    }
    return out.join('');
  },
  load: function(url) {
    var matched = url.match(this.RegExp),
      data = {}, list = this.list,
      silent = true;

    var state = history.state || {},
      stateData = state.data || {},
      dataNotMatched = false;


    for( var i = 0, _i = list.length; i < _i; i++ ){
      var listElement = list[ i ];
      data[listElement] = matched[i+1];
      if(stateData[listElement] !== matched[i+1])
        dataNotMatched = true;
    }

    for(i in stateData){
      if(!(i in data)){
        dataNotMatched = true;
      }
    }
    if(state.place === this.pageName || dataNotMatched){
      silent = false;
    }

    ACTION.NAVIGATE.execute(this.pageName, data, silent);
    /*
    store.set({
      'navigation.current': event.state.place,
      'navigation.data': event.state.data || {}
    });
     */
  },
  match: function(url) {
    return (url.match(this.RegExp) !== null? 1 : 0)*url.length;
  }
};
var jwtDecode = function (jwt) {

  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
      var code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = '0' + code;
      }
      return '%' + code;
    }));
  }

  function decode(str) {
    var output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw "Illegal base64url string!";
    }

    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }

  var jwtArray = jwt.split('.');

  return {
    header: decode(jwtArray[0]),
    payload: decode(jwtArray[1]),
    signature: decode(jwtArray[2])
  };

};
if(typeof window !== 'undefined'){
  window.Route = Route;
  window.jwtDecode = jwtDecode;
}
