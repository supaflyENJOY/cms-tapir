import {Component} from '../Component.jsx';
import {List} from '../List/List.jsx';
var Select = new Component({
	ctor: function(cfg) {
		this.createDOM();
		this.initBinding();

		this.afterInit && this.afterInit();
	},
	prop: {
		items: {type: Component.Property.Any, default: false},
		value: {type: Component.Property.Any, default: false}
	},
	createDOM: function() {
		var val = this.value,
			group = this.group,
			list,
			el = this.dom = this.inputEl = <select onChange={(val)=> {
				this.value.set(val.target.value);
			}}>
				{list = <List thin={true} items={this.items}>{(item)=><option value={item.key}>{item.value}</option>}</List>}
			</select>;


		this.afterDOM && this.afterDOM();
	},
	setItems: function(items) {
		this.items.splice(0, this.items.length);
		items.forEach(item=>this.items.push(item));
		this.value.set(this.dom.value);
	},
	initBinding: function() {
		var _self = this;

		this.sub([this.value, this.group], function (val, group) {
			_self.inputEl.checked = val === group;
		});
	}
});


export { Select };