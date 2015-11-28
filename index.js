var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");
var os = require("os");

var key = '';
var server;

app.get('/', function(req, res) {
	var author = req.query["me"];

	if (author) {
		var url = "http://academic.research.microsoft.com/json.svc/";

		url += "search?";

		url += "AppId=" + key;

		url += "&FullTextQuery=" + author.replace(' ', '+');
		url += "&ResultObjects=" + "author";
		url += "&StartIdx=" + "1";
		url += "&EndIdx=" + "1";

		console.log(new Date().getTime());
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(new Date().getTime());

				var json = JSON.parse(body);

				if (json["d"]["Author"]["Result"] === null) {
					console.log("error retrieving author");
				} else {
					console.log(json["d"]["Author"]["Result"][0]["HIndex"]);
				}

				header("", homepage, res);
			}
		});
	} else {
		header("", homepage, res);
	}
});

homepage = function(input, res) {
	page = input;

	page += add("<div class='search'>");
	page += add("<h4>See your research impact:</h4>");
	page += add("<form method='get'> <input type='text' name='me' placeholder='Your Name'/> <button type='submit'>Enter</button></form>");

	page += add("</div>");

	page += add("</html>");

	res.send(page);
};

header = function(input, callback, res) {
	fs.readFile("static/header.html", "utf8" , function(err, data) {
		if (!err) {
			return callback(input + data, res);
		}
	});
};

add = function(string) {
	return string + os.EOL;
};

fs.readFile("API key.txt", "utf8" , function(err, data) {
	key = data;

	server = app.listen(3000);
});

app.use('/static', express.static('static'));