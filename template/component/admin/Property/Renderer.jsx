import { Input } from "component/Input/Input.jsx";
import List from "component/List/List.jsx";
import { Select } from "component/Select/Select.jsx";

var propWrapper = function(key, editor) {
	return <div className={'admin-property'}>
		<span className={'admin-property-name'}>{key}</span>{editor}
	</div>
};

var renderers = {
	String: function(key, schema, value) {
		return propWrapper(key, <Input value={value}/>);
	},
	Number: function(key, schema, value) {
		return propWrapper(key, <Input value={value}/>)
	},
	Array: function(key, schema, value) {
		window.www = value;
		return propWrapper(key, <div><List items={value} direction={'vertical'}>{(item)=>subItemRenderer(schema.of, schema, item)}</List><input type={'button'} value={'Add item'}/></div>)
	},
	Block: function(key, schema, value) {
		return propWrapper(key, editors.Block('Block', schema, value));
	}
};

var allBlocks = new Store.Value.Array([]);

var updateSelectableBlocks = function(block) {
	allBlocks.splice(0, allBlocks.length);
	block.forEach(name => allBlocks.push({key: name, value: name}));
};

var editors = {
	Block: function(type, schema, value) {
		return <Select value={value.name} items={allBlocks}/>
	}
}

var subItemRenderer = function(type, schema, value) {
	if(type in editors){
		return editors[type](type, schema, value)
	}
	debugger
};

var renderProperty = function(prop) {
	var type = prop.schema.type;
	if(type in renderers){
		return renderers[type](prop.key, prop.schema, prop.value);
	}else{
		return propWrapper(prop.key);
	}
};

export {renderProperty, updateSelectableBlocks}