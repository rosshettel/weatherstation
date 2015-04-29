"use strict";

var express = require('express'),
	app = express(),
	server;

app.use(express.static('static'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/static/index.html')
});

server = app.listen(3000, function () {
	var address = server.address();

	console.log('Server listening at http://%s:%s', address.address, address.port);
});
