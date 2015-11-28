var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");

var key = '';
var server;

app.get('/', function(req, res) {
	var author = req.query["me"] ? req.query["me"] : "";

	var url = "http://academic.research.microsoft.com/json.svc/";

	url += "search?";

	url += "AppId=" + key;

	url += "&FullTextQuery=" + author.replace(' ', '+');
	url += "&ResultObjects=" + "author";
	url += "&StartIdx=" + "1";
	url += "&EndIdx=" + "1";

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);

			if (json["d"]["Author"]["Result"] === null) {
				console.log("error retrieving author");
			} else {
				console.log(json["d"]["Author"]["Result"][0]["HIndex"]);
			}

			res.send(JSON.stringify(json, null, 4));
		}
	});
});

fs.readFile("API key.txt", "utf8" , function(err, data) {
	key = data;

	server = app.listen(3000);
});
