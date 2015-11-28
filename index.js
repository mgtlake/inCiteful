var express = require("express");
var app = express();
var fs = require("fs");
var request = require("request");
var os = require("os");

var key = '';
var server;

app.get('/', function(req, res) {
	var author = req.query["author"];

	if (author) {
		var url = "http://academic.research.microsoft.com/json.svc/";

		url += "search?";

		url += "AppId=" + key;

		url += "&FullTextQuery=" + author.replace(' ', '+');
		url += "&ResultObjects=" + "author";
		url += "&StartIdx=" + "1";
		url += "&EndIdx=" + "3";

		console.log(new Date().getTime());
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(new Date().getTime());

				var json = JSON.parse(body);

				header("", results, {"res": res, "json": json});
			}
		});
	} else {
		header("", homepage, {"res": res});
	}
});

homepage = function(input, args) {
	page = input;

	page += add("<div class='search'>");
	page += add("<h4>See your research impact:</h4>");
	page += add("<form method='get'> <input type='text' name='author' placeholder='Your Name'/> <button type='submit'>Enter</button></form>");

	page += add("</div>");

	page += add("</html>");

	res = args["res"];
	res.send(page);
};

results = function(input, args) {
	json = args["json"];

	page = input;

	page += add("<div class='results'>");

	if (json["d"]["Author"]["Result"] === null) {
		page += add("<h2>Sorry, we couldn't find you :(</h2>");
	} else {
		var me = json["d"]["Author"]["Result"][0];
		var name = me["FirstName"] + " " + me["MiddleName"] + " " + me["LastName"];
		var affiliation = me["Affiliation"]["Name"];
		var citeCount = me["CitationCount"];
		var pubCount = me["PublicationCount"];
		var h_index = me["HIndex"];
		var g_index = me["GIndex"];

		page += add("<h2>" + name + "</h2>");
		page += add("<h3>Institution: " + affiliation + "</h3>");
		page += add("<h3>Total Citation Count: " + citeCount + "</h3>");
		page += add("<h3>Total Publication Count: " + pubCount + "</h3>");
		page += add("<h3>H-Index: " + h_index + "</h3>");
		page += add("<h3>G-Index: " + g_index + "</h3>");
	}

	page += add("</div>");

	page += add("</html>");

	res = args["res"];
	res.send(page);
};

header = function(input, callback, args) {
	fs.readFile("static/header.html", "utf8" , function(err, data) {
		if (!err) {
			return callback(input + data, args);
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