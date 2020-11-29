var NS = window['NS'] = function(cfg) {
    if(cfg.consts){
        this.consts = NS.apply(NS.apply({}, this.consts), cfg.consts);
        delete cfg.consts;
    }
    NS.apply(this, cfg);
    this._update = this._update.bind(this);
    this.resize = this.resize.bind(this);
    this.init();
};
NS.apply = function(a,b) {
    for(var k in b){
        a[k] = b[k];
    }
    return a;
};

(function(NS, glob, document){

    var ArraySlice = [].slice;
    var svgNS = 'http://www.w3.org/2000/svg';

    var setters = {
        cls: function(el) {
            return function(cls) {
                var tagName = el.tagName.toLowerCase();
                if( tagName in customElementClassNameSetter ){
                    customElementClassNameSetter[tagName](el, cls);
                }else{
                    el.className = D.cls.apply(D, arguments);
                }
            }
        },
        attr: function(el, attrName) {
            return function(val) {
                if(val !== void 0 && val !== false){
                    el.setAttribute( attrName, val );
                }else{
                    el.removeAttribute(attrName)
                }
            }
        },
        style: function(s, styleProp) {
            return function(val) {
                if(val !== void 0 && val !== false){
                    s[styleProp] = val;
                }else{
                    delete s[styleProp];
                }
            }
        }
    };


    var used = {
        cls: true, className: true, 'class': true, classname: true,
        attr: true, style: true, renderTo: true,
        prop: true, bind: true,
        on: true, renderto: true, el: true
    };

// ~jsx h function
    var domEl = function( type, cfg ){
        var typeOfType = typeof type;

        if(typeOfType === 'function'){
            // factory passed
            return type(cfg, ArraySlice.call(arguments, 2));
        }else if(type !== null && typeof type === 'object' && type.hook){
            // hooked future element creation
            return type.hook(cfg, ArraySlice.call(arguments, 2));
        }


        cfg = cfg || {};
        var cls = cfg.cls || cfg['class'] || cfg.className,
          style = cfg.style,

          attr = cfg.attr || {},
          prop = cfg.prop,
          on = cfg.on || {},
          renderTo = cfg.renderTo,
          el = cfg.el || (type in customElementCreate ? customElementCreate[type](type, cfg) : document.createElement( type ));

        var i, _i, name;

        for(i in cfg)
            if( cfg.hasOwnProperty(i)){
                name = i.toLowerCase();
                if(name in used)
                    continue;

                if(name.substr(0, 2) === 'on'){
                    // it is an event
                    on[ name.substr( 2 ) ] = cfg[ i ];
                }else{
                    // attribute
                    attr[i] = cfg[i];
                }

            }

        if( cls ){
            if(typeof cls === 'function'){
                cls(setters.cls(el));
            }else if(typeof cls === 'object' && cls.hook){
                cls.hook(setters.cls(el));
            }else if(typeof cls === 'object'){

                var resolvedCls = Array.isArray(cls)?D.cls.apply(D, cls):D.cls(cls);
                if(typeof resolvedCls === 'function'){
                    resolvedCls(setters.cls(el));
                }else{
                    setters.cls(el)(resolvedCls);
                }
            }else{
                setters.cls(el)(cls);
            }
        }

        if( style ){
            if(typeof style === 'string'){
                el.style = style;
            }else{
                for( i in style ){
                    var s = el.style;
                    if(style.hasOwnProperty( i )){
                        if( typeof style[ i ] === 'function' ){
                            style[ i ]( setters.style( s, i ) );
                        }else if(typeof style[ i ] === 'object'&& style[ i ] !== null && style[ i ].hook){
                            return style[ i ].hook(setters.style(s, i));
                        }else{
                            setters.style( s, i )( style[ i ] );
                        }
                    }
                }
                //NS.apply( el.style, style );
            }
        }

        for( i in attr ){
            if(attr.hasOwnProperty( i )){
                if( typeof attr[ i ] === 'function' ){
                    attr[ i ]( setters.attr( el, i ) );
                }else if(typeof attr[ i ] === 'object'&& attr[ i ] !== null && attr[ i ].hook){
                    return attr[ i ].hook(setters.attr(el, i));
                }else{
                    setters.attr( el, i )( attr[ i ] );
                }
            }
        }

        for( i in prop ){
            prop.hasOwnProperty( i ) && ( el[ i ] = prop[ i ] );
        }

        for( i in on ){
            on.hasOwnProperty( i ) && el.addEventListener( i, on[ i ] );
        }

        for( i = 2, _i = arguments.length; i < _i; i++ ){
            var child = arguments[ i ];
            D.appendChild( el, child );
        }

        if( renderTo ){
            D.appendChild( renderTo, el );
        }

        return el;
    };

    var D = NS.D = {
        svg: null,
        label: null,
        div: null,
        span: null,
        path: null,
        canvas: null,
        input: null,
        textarea: null,
        tBody: null,
        tHead: null,
        th: null,
        td: null,
        tr: null,
        Text: function( val ){ return document.createTextNode( val );}
    };
    'div,template,span,input,label,canvas,span,textarea,table,tr,td,th,tBody,tHead'.split( ',' ).forEach( function( name ){
        D[ name ] = function(){
            return domEl.apply( null, [ name ].concat(ArraySlice.call(arguments)));
        };
    } );

    var customElementCreate = {};
    var customElementClassNameSetter = {};
    var createElementSVG = function(name) {
          var el = document.createElementNS( svgNS, name );
          el.setAttribute( 'xmlns', svgNS );
          return el;
      },
      setClassNameSVG = function(el, cls) {
          el.setAttribute( 'class', cls );
      };
    'svg,path,circle,g,defs,marker,ellipse,animateTransform,mask,rect'.split( ',' ).forEach( function( name ){
        customElementCreate[name] = createElementSVG;
        customElementClassNameSetter[name] = setClassNameSVG;
        D[ name ] = function(cfg){
            if( !cfg ){
                cfg = {};
            }
            cfg.el = createElementSVG( name );
            return domEl.apply( null, [ null ].concat(ArraySlice.call(arguments)))
        };
    } );

    D.html = function(cfg){
        var el = domEl('div', cfg);
        el.innerHTML =  ArraySlice.call(arguments,1).join('\n');
        return el;
    };
    D.h = domEl;

    D.ext = function(el, cfg) {
        cfg.el = el;
        if(el.className && cfg.cls){
            if( typeof cfg.cls === 'string' ){
                cfg.cls += ' '+el.className;
            }else if(Array.isArray(cfg.cls)){
                cfg.cls.push(el.className);
            }else{
                debugger
            }
        }
        return D.div(cfg);
    }
    D.f = function(cfg, children) {
        return children;
    };
    D.isInDOM = function(el) {
        return document.body.contains(el);
    };
    D._recursiveCmpCall = function(el, sub, fnName){
        if(sub.__cmp)
            sub.__cmp[fnName] && sub.__cmp[fnName](el);
        for( var i = 0, _i = sub.childNodes.length; i < _i; i++ ){
            var childNode = sub.childNodes[ i ];
            D._recursiveCmpCall(sub, childNode, fnName);
        }
    };

    D.replaceChildren = function(el) {
        D.removeChildren(el);
        D.appendChild.apply(D, arguments);
    };
    D.removeChildren = function(el){
        var subEl;
        var isInDOM = D.isInDOM(el);
        while((subEl = el.lastChild)){
            isInDOM && D._recursiveCmpCall(el, subEl, 'beforeRemoveFromDOM');
            el.removeChild(subEl);
            isInDOM && D._recursiveCmpCall(el, subEl, 'afterRemoveFromDOM');
        }
    };
    var DFragment = DocumentFragment;
    D.insertBefore = function(newChild, refChild) {
        var f = document.createDocumentFragment();
        D.appendChild(f, newChild);
        var el = refChild.parentNode,
          subEl = newChild;

        var isInDOM = D.isInDOM(el);
        isInDOM && D._recursiveCmpCall(el, f, 'beforeAddToDOM');
        el.insertBefore( f, refChild );
        isInDOM && D._recursiveCmpCall(el, {childNodes: newChild}, 'afterAddToDOM');

    };
    D.insertAfter = function(newChild, refChild) {
        var f = document.createDocumentFragment();
        D.appendChild(f, newChild);
        var el = refChild.parentNode,
          subEl = newChild;

        var isInDOM = D.isInDOM(el);
        isInDOM && D._recursiveCmpCall(el, f, 'beforeAddToDOM');
        var next = refChild.nextSibling;
        if(next){
            el.insertBefore( f, next );
        }else{
            el.appendChild( f );
        }

        isInDOM && D._recursiveCmpCall(el, {childNodes: newChild}, 'afterAddToDOM');

    };
    D.appendChild = function(el, subEl){
        var type = typeof subEl;

        if(subEl === null){
            return ;
        }
        var notObject = type !== 'object';
        var isHook = !notObject && ('hook' in subEl);

        if(isHook){
            type = 'function'; notObject = true;
        }
        if( notObject ){
            // TODO : add hook
            if( type === 'function' ){
                var tmp = D.Text('');//( {cls: 'zero-wrapper'} );
                el.appendChild( tmp );
                var list = [],
                  isNotFragment = !(el instanceof DocumentFragment); // TODO: add attribute on real add to dom

                isNotFragment && el.setAttribute('data-hooked', 'yep');

                // maybe do it through outer weak map?
                isNotFragment && (el.__un = el.__un || []);
                var hookFn, release;

                if(isHook){
                    hookFn = function(val){
// TODO: append 2 TextNodes and remove children between them

                        if(list.length === 1){
                            list[0].textContent = val;
                        }else{

                            if(el instanceof DFragment){
                                el = tmp.parentNode;
                            }
                            if(!el)
                                return;

                            for( var i = 0, _i = list.length; i < _i; i++ ){
                                list[ i ].parentNode === el && el.removeChild( list[ i ] );
                            }
                            var fragment = document.createDocumentFragment();
                            D.appendChild( fragment, ArraySlice.call( arguments ) );
                            list = ArraySlice.call( fragment.childNodes );

                            if( !tmp || !tmp.parentNode )
                                return;
                            el.insertBefore( fragment, tmp );
                        }
                    };
                    release = subEl.hook( hookFn );
                    isNotFragment && el.__un.push(release);
                }else{

                    hookFn = function(){
// TODO: append 2 TextNodes and remove children between them

                        if(el instanceof DFragment){
                            el = tmp.parentNode;
                        }
                        if(!el)
                            return;

                        for( var i = 0, _i = list.length; i < _i; i++ ){
                            list[ i ].parentNode === el && el.removeChild( list[ i ] );
                        }
                        var fragment = document.createDocumentFragment();
                        D.appendChild( fragment, ArraySlice.call( arguments ) );
                        list = ArraySlice.call(fragment.childNodes);

                        if(!tmp || !tmp.parentNode)
                            return;

                        var isInDOM = D.isInDOM(el);
                        isInDOM && D._recursiveCmpCall(el, fragment, 'beforeAddToDOM');
                        el.insertBefore(fragment, tmp);
                        isInDOM && D._recursiveCmpCall(el, {childNodes: list}, 'afterAddToDOM');

                    };
                    release = subEl( hookFn );
                    isNotFragment && el.__un.push(release);
                }
            }else if( subEl !== void 0 && subEl !== false && subEl !== null ){
                el.appendChild( D.Text( subEl ) );
            }
        }else if('dom' in subEl){
            var isInDOM = D.isInDOM(el);
            subEl.dom.__cmp = subEl;
            isInDOM && D._recursiveCmpCall(el, subEl.dom, 'beforeAddToDOM');
            D.appendChild(el, subEl.dom);
            //el.appendChild( subEl.dom );
            isInDOM && D._recursiveCmpCall(el, subEl.dom, 'afterAddToDOM');

            //subEl
        }else if( Array.isArray(subEl) ){
            subEl.forEach(function(subEl){ D.appendChild( el, subEl ); });
        }else{
            var isInDOM = D.isInDOM(el);
            isInDOM && D._recursiveCmpCall(el, subEl, 'beforeAddToDOM');
            el.appendChild( subEl );
            isInDOM && D._recursiveCmpCall(el, subEl, 'afterAddToDOM');
        }
    };
    D.join = function(arr, delimiter){
        var out = [], isFn = typeof delimiter === 'function';

        for( var i = 0, _i = arr.length - 1; i < _i; i++ ){
            out.push(arr[i], isFn?delimiter(i):delimiter);
        }
        if(i < _i+1)
            out.push(arr[i]);
        return out;
    };

    var dpID = 1;
    var DataPiece = function(id){this.id = id;};
    DataPiece.prototype = {value: void 0, update: function(){}};
    var DataPieceFactory = function(refs, fn, scope) {
        var id = dpID++;
        var dp = new DataPiece(id);
        refs.push(dp);
        fn.call(scope, function(val) {
            dp.value = val;
            dp.update();
        });
        return dp;
    };
    var RefHash = function(){};RefHash.prototype = {any: false};
    D.__cls = function(args, refs) {
        return function(update) {
            var i, _i, lastCls,
              constructCls = function() {
                  var cls = D._cls(args, [], 0);
                  if(lastCls !== cls)
                      update(lastCls = cls);
              };
            for( i = 0, _i = refs.length; i < _i; i++ )
                refs[ i ].update = constructCls;

            constructCls();
        };
    };
    D._cls = function(args, refs, depth) {
        var out = [], i = 0, _i = args.length, token, tmp, key;

        for(;i<_i;i++){
            token = args[i];
            if(typeof token === 'string' && token){
                out.push( token );
            }else if(typeof token === 'object'){
                if(token instanceof DataPiece){
                    token.value && out.push( token.value );
                }else if ( token.hook ){
                    args[i] = DataPieceFactory(refs, token.hook, token);
                }else if(Array.isArray(token)){
                    tmp = D._cls(token, refs, depth+1);
                    // TODO check for push tmp
                    tmp && out.push( token );
                }else{
                    for(key in token){
                        if(token[key] === null)
                            continue;
                        if(token[key] instanceof DataPiece){
                            token[key].value && out.push(key);
                        }else if(typeof token[key] === 'function'){
                            token[ key ] = DataPieceFactory(refs, token[ key ]);
                        }else if(typeof token[key] === 'object' && token[key].hook){
                            token[key] = DataPieceFactory(refs, token[ key ].hook, token[key])
                        }else{
                            token[ key ] && out.push( key );
                        }
                    }
                }
            }else if(typeof token === 'function'){
                args[i] = DataPieceFactory(refs, args[i]);
            }
        }
        return depth === 0 && refs.length ? D.__cls(args, refs): out.join(' ');
    };
    D.cls = function() {
        return D._cls(arguments, [], 0);
    };

    D.escapeCls = function(cls) {
        return (cls+'').replace(/[^a-zA-Z0-9\-_]/g,'');
    };

    var _construct = function(ctor, cfg, p) {
        //if it is not an arrow function
        if('prototype' in ctor && ctor.prototype.constructor === ctor){
            var cls = new ctor(cfg || {}, p);
            return cls;//'dom' in cls ? cls.dom : cls;
        }else{
            return ctor(cfg || {}, p);
        }
    };

    var usage = {};
    var populate = function(name, construct) {
        var tokens = name.split('.'),
          last = tokens.pop(),
          first = tokens.shift();

        // ES 6 consts are not in global scope. So we can not just add vars to window
        var pointer = first?
          new Function('glob', 'return typeof '+first+' !== "undefined"?'+first+':(glob["'+first+'"] = {})')(glob)
          :glob;

        try{
            tokens.reduce( function( pointer, token, i, full ){
                return pointer[ token ] || ( pointer[ token ] = {} );
            }, pointer )[ last + '' ] = construct;
        }catch(e){
            console.error('can not populate', name)
        }
        return construct;
    };
    D.declare = function(name, ctor) {
        name = name.replace(/[\/\\]/g,'__');

        var uses;
        if(typeof ctor === 'object'){
            var original = ctor;
            var Factory = function(a,b,c,d){
                if(!(this instanceof Factory)){
                    return new Factory(a,b,c,d);
                }
                original.ctor && original.ctor.apply(this, arguments);
            };
            Factory.prototype = ctor;
            Factory.constructor = Factory;
            ctor = Factory;
        }
        if(name in usage){
            log('updated', `${name} (${usage[name].instances.length})`)

            usage[ name ].ctor = ctor;
            uses = usage[ name ].instances;
            for( var i = 0, _i = uses.length; i < _i; i++ ){
                var u = uses[ i ], d = u.dom;
                u.dom = _construct(ctor, u.cfg, u.p);
                d.dom && (d = d.dom);
                !Array.isArray(d) && (d = [d]);
                if(d.length && d[0].parentNode){

                    var dParent = d[0].parentNode,
                      isInDOM = D.isInDOM(dParent),
                      newChild = u.dom;

                    if('dom' in u.dom){
                        newChild = newChild.dom;
                        newChild.__cmp = u.dom;
                    }

                    for(var j = 0, _j = d.length - 1; j < _j; j++){
                        isInDOM && D._recursiveCmpCall(dParent, d[j], 'beforeRemoveFromDOM');
                        dParent.removeChild( d[j] )
                    }

                    var lastEl = d[j];
                    isInDOM && D._recursiveCmpCall(dParent, lastEl, 'beforeRemoveFromDOM');
                    var fragment = document.createDocumentFragment();

                    for(var j = 0, _j = newChild.length; j < _j; j++){
                        isInDOM && D._recursiveCmpCall(dParent, newChild[j], 'beforeAddToDOM');
                        fragment.appendChild(newChild[j])
                    }
                    dParent.replaceChild( fragment, lastEl )
                    if(isInDOM){
                        for( var j = 0, _j = d.length; j < _j; j++ ){
                            D._recursiveCmpCall( dParent, d[ j ], 'afterRemoveFromDOM' );
                        }
                        for( var j = 0, _j = newChild.length; j < _j; j++ ){
                            D._recursiveCmpCall( dParent, newChild[ j ], 'afterAddToDOM' );
                        }
                    }
                }
            }
        }else{

            log('declared', `${name}`);
            uses = (usage[ name ] = {ctor: ctor, instances: []}).instances;
        }
        return populate(name, function construct (cfg, p) {
            var dom = _construct(ctor, cfg, p);
            uses.push({dom: dom, cfg: cfg, p: p});
            return dom;
        });
    };
    var _log = [], later = false,
      realLog = function() {
          later = false;
          var aggregated = _log.reduce(function(s, item) {
              (s[item.evt] || (s[item.evt] = [])).push(item);
              return s;
          }, {});
          _log.length = 0;
          for(var evt in aggregated){
              console.log('DOM:'+evt+' → '+aggregated[evt].map(function(item) {
                  return item.args.join(' ');
              }).join(', '));
          }
      };
    var log = function(evt) {
        _log.push({type: 'log', evt: evt, args: ArraySlice.call(arguments, 1)});
        if(!later)
            later = setTimeout(realLog, 3000);

    };
    var emptyFn = function() {};

    D.Unsubscribe = function(fn) {
        this.fn = [];
        fn && this.fn.push(fn);
    };
    D.Unsubscribe.prototype = {
        un: function() {
            var fn;
            while((fn = this.fn.pop()))
                fn();
        },
        add: function(fn) {
            typeof fn !== 'function' && (fn = getCallableFunction(fn));
            this.fn.push(fn);
        }
    };
    var getCallableFunction = function(obj) {
        if(obj instanceof D.Unsubscribe){
            return function() {
                obj.un();
            }
        }
    };

    var unsubscribable = function(name) {
        return function(el, fn, arg) {
            typeof fn !== 'function' && (fn = getCallableFunction(fn));
            el.addEventListener(name, fn, arg);
            return new D.Unsubscribe(function() {
                el.removeEventListener(name, fn, arg);
            });
        };
    };
    D.mouse = {
        down: unsubscribable('mousedown'),
        up: unsubscribable('mouseup'),
        move: unsubscribable('mousemove'),
        over: unsubscribable('mouseover'),
    };

    D.AnimationFrame = function(fn) {
        var requested = false,
          arg,

          update = function() {
              fn.call(null, arg);
              requested = false;
          };

        return function(a) {
            arg = a;
            if(!requested){
                requestAnimationFrame(update);
                requested = true;
            }
        };
    };
    D.overlay = {
        inited: false,
        show: function() {
            this.init();
            this.el.style.display = 'block';
        },
        hide: function() {
            this.init();
            this.el.style.display = 'none';
        },
        init: function() {
            if(this.inited)
                return;
            this.inited = true;
            this.el = D.div({
                renderTo: document.body,
                cls: 'D-overlay', style: {display: 'none', position: 'absolute', zIndex:10000, left: 0, right: 0, top: 0, bottom: 0}})
            this.el.addEventListener('mousemove', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, true)
        }
    };
    D.findParent = function(el, fn) {
        var test;
        while(el){
            test = fn(el);
            if(test === true)
                return el;

            el = el.parentNode
        }
    };
    D.s = D.h;

})(window['NS'], typeof window !== "undefined" ? window :
  typeof WorkerGlobalScope !== "undefined" ? self :
    typeof global !== "undefined" ? global :
      typeof GLOBAL !== "undefined" ? GLOBAL :
        Function("return this;")(), document);

var D = NS.D,
  div = D.div,
  span = D.span,
  view = {
      page: {},
      cmp: {}
  };
