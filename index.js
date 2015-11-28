var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");

var key = '';
var server;

app.get('/', function(req, res) {
	var url = "http://academic.research.microsoft.com/json.svc/";

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.send(body);
		}
	});
});

fs.readFile("API key.txt", "utf8" , function(err, data) {
	key = data;
	console.log(key);

	server = app.listen(3000, function() {
		var host = server.address().address;
		var port = server.address().port;

		console.log("Example app listening at http://%s:%s", host, port);
	});
});
