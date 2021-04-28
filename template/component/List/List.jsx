import {Component} from '/component/Component.jsx';
import './List.scss';

var List = new Component({
	name: 'List',
	ctor: function(cfg) {
		this.createDOM(cfg);
		this.initBinding();

		this.afterInit && this.afterInit();
	},
	prop: {
		items: {type: Array},
		direction: {type: String},
		thin: {type: Boolean},
	},
	createDOM: function(cfg) {
		console.log(this.direction.get())
		var val = this.value,
			el;
		if(this.thin.get()){
			el = this.dom = D.Text('');
		}else{
			el = this.dom = D.div({
				cls: D.cls(_=>this.direction.hook((d)=>{
					_(D.cls('cmp-list', cfg.class, d?'cmp-list__'+d:null))
				})),// ['cmp-list', cfg.class, T.concat('cmp-list__',this.direction)]),
				style: {position: 'relative', display: 'flex'}
			});
		}



		this.afterDOM && this.afterDOM();
	},
	thinInited: false,
	initThinBindings: function(_itemsMap, renderChild) {
		var _self = this;
		if(this.thinInited)
			return;

		this.thinInited = true;
		D.insertAfter( this.items.get().map( renderChild ), _self.dom );

		this.items.on('add', function(item, prevItem, nextItem) {
			_self.log('add', item);
			var dom;
			if(prevItem){
				// insert after
				dom = _itemsMap.get(prevItem)
				D.insertAfter(renderChild(item), dom[dom.length - 1]);
			}else if(nextItem){
				// insert before
				dom = _itemsMap.get(nextItem)
				D.insertBefore(renderChild(item), dom[0]);

			}else{
				D.insertAfter(renderChild(item), _self.dom);
			}
		})

	},
	afterAddToDOM: function() {
		if(this.thin.get()){
			this.initThinBindings(this._items, this._renderChild);
		}
	},
	initBinding: function() {
		var _self = this;

		var _itemsMap = this._items = new WeakMap();

		var renderChild = this._renderChild = function(item) {
			var dom = _self.children[0].map( child => typeof child === 'function' ? child( item ) : 'dom' in child ? child.dom : child.cloneNode(true) );
			_itemsMap.set(item, dom);
			return dom;
		};

		this.items.on('remove', function(item) {
			_self.log('remove', item);
			var dom = _itemsMap.get(item);
			for( var i = 0, _i = dom.length; i < _i; i++ ){
				var domElement = dom[ i ];
				if('dom' in domElement){
					domElement = domElement.dom;
				}
				domElement.parentNode.removeChild(domElement);
				//_self.dom.removeChild(domElement);
			}
			_itemsMap.delete(item);
		});

		if(this.thin.get()){
			return;// this.initThinBindings(_itemsMap, renderChild);
		}

		/*if(!this.items)
			return;*/

		D.replaceChildren( _self.dom, this.items.get().map( renderChild ) );

		this.items.on('add', function(item, prevItem, nextItem) {
			_self.log('add', item);
			var dom;
			if(prevItem){
				// insert after
				dom = _itemsMap.get(prevItem)
				dom = dom[dom.length - 1];
				if('dom' in dom){ dom = dom.dom; }
				D.insertAfter(renderChild(item), dom);
			}else if(nextItem){
				// insert before
				dom = _itemsMap.get(nextItem);
				dom = dom[0];
				if('dom' in dom){ dom = dom.dom; }
				D.insertBefore(renderChild(item), dom);
			}else{
				D.replaceChildren(_self.dom, renderChild(item));
			}
		})


	}
});

export { List };

export default List;