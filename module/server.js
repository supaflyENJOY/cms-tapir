const fs = require( 'fs' );

var Server = function(main) {
	this.main = main;
	this.sockets = new Set();
	main.registerModule('Server', this);
};
Server.prototype = {
	init: function() {
		const actual = this.main.actual;
		const http = require('http');
		const sockets = this.sockets;

		try{
			const httpServer = this.httpServer = http.createServer(this.main.app);

			if(actual.USE_HTTPS) {
				const https = require('https');
				const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+actual.USE_HTTPS+'/privkey.pem', 'utf8');
				const certificate = fs.readFileSync('/etc/letsencrypt/live/'+actual.USE_HTTPS+'/cert.pem', 'utf8');
				const ca = fs.readFileSync('/etc/letsencrypt/live/'+actual.USE_HTTPS+'/chain.pem', 'utf8');

				const credentials = {
					key: privateKey,
					cert: certificate,
					ca: ca
				};
				const httpsServer = this.httpsServer = https.createServer(credentials, this.main.app);
				httpsServer.on('connection', function(socket){
					sockets.add(socket);
					socket.once('close', function(){
						sockets.delete(socket);
					});
				});

				httpsServer.listen(443, function(){
					console.log('Tapir-CMS HTTPS Server running on port 443');
				});
			}

			httpServer.on('connection', function(socket){
				sockets.add(socket);
				socket.once('close', function(){
					sockets.delete(socket);
				});
			});
			httpServer.listen(actual.PORT, function(){
				console.log(`Tapir-CMS LISTEN: http://${actual.HOST}:${actual.PORT}`);
			});

		}catch(e){
			console.error(e.message);
		}
	},
	'~destroy': function(cb) {
		var actual = this.main.actual;
		var sockets = this.sockets;
		for (const socket of sockets) {
			socket.destroy();
			sockets.delete(socket);
		}
		if(this.httpServer){
			this.httpServer.close(function() {
				console.log(`Tapir-CMS CLOSED: http://${actual.HOST}:${actual.PORT}`);
				cb && cb();
			});
		}
	},
	constructor: Server
};
module.exports = Server