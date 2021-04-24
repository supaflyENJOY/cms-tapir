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