document.body.style.background = 'red';
window.sendEvent = function(name, data) {
	var event = new CustomEvent(communicationHash, { detail: {name, data} });
	window.parent.document.dispatchEvent(event)
};

var communicationHash = D('script').map(s=>s.src.split('/admin/admin.js?hash=')).filter(s=>s.length>1)[0][1];
sendEvent('init', {type: 'communication'});

window.onmessage = function(e){
	if (e.data == 'hello') {
		alert('It works!');
	}
};


var elInfos = [], lastMatched = [];
var selectFn = function(e) {
	var x = e.pageX, y = e.pageY,
		matched = [],
		matchedIDs = {};
	for( var i = 0, _i = elInfos.length; i < _i; i++ ){
		var elInfo = elInfos[ i ],
				rect = elInfo.rect;

		if(
			x<rect.left || x>rect.left +rect.width ||
			y<rect.top || y>rect.top +rect.height
		)
			continue;

		matched.push(elInfo);
		matchedIDs[elInfo.id] = elInfo;
	}
	if(!e.ctrlKey){
		var lastIDs = {};
		lastMatched.forEach( elInfo =>{
			lastIDs[elInfo.id] = elInfo;
			//if(!(elInfo.id in matchedIDs)){
				elInfo.selected.set( false )
			//}
		} );

		if( matched ){
			for( var i = 0, _i = matched.length; i < _i; i++ ){
				var matchedElement = matched[ i ];
				if(i<_i+1 && i in lastMatched){
					continue
				}else{
					matched = matched[i];
					break;
				}
			}
			if(Array.isArray(matched))
				matched = matched[0];
			matched.selected.set( true );
			console.log(matched)
		}


		lastMatched = [ matched ];
	}else{
		// write multiselect logic
	}
};

updateBlocks = function() {
	RenderBlocks.rendered.forEach(function(item, n) {
		var el = item.el;
		if('dom' in el){
			el = el.dom;
		}
		var elInfo = elInfos[n] || {el: el, id: n, data: item.data, info: item.info};

		elInfos[n] = elInfo;
		if(el instanceof Node){
			var rect = D.getRect(el);

			elInfo.rect = rect;
			elInfo.selected = elInfo.selected || new Store.Value.Boolean(false);
			if(!elInfo.selection){
				elInfo.selection = D.div( {
					onclick: selectFn,
					renderTo: document.body,
					style: {
						border: _=>elInfo.selected.hook(val=> _(val ? '2px dashed #0efdc5' : '')),
						//border: Store.AND(elInfo.selected, (_)=>_('2px dashed #0efdc5')),
						'box-sizing': 'border-box',
						position: 'absolute',

						background: `rgba(0,0,0,0.1)`,
						'z-index': 1000000
					}
				} );
			}

			D.ext(elInfo.selection, {
				style: {
					left: rect.left + 'px',
					top: rect.top + 'px',
					width: rect.width + 'px',
					height: rect.height + 'px'
				}
			})


		}
	});
};
updateBlocks();