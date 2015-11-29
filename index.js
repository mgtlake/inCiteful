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
		fs.readFile("dataa/" + author + ".json", "utf8" , function(err, data) {
			if (err) {
				var url = "http://academic.research.microsoft.com/json.svc/search?";

				url += "AppID=" + key;

				url += "&FullTextQuery=" + author.replace(' ', '+');
				url += "&ResultObjects=" + "author";
				url += "&StartIdx=" + "1";
				url += "&EndIdx=" + "1";

				request(url, function (error, response, body) {
					if (!error && response.statusCode == 200) {

						var json = JSON.parse(body);

						var callbacks = [];
						callbacks.push(end);
						callbacks.push(results);

						var me = json["d"]["Author"]["Result"] !== null ? json["d"]["Author"]["Result"][0] : null;

						header("", callbacks, {"res": res, "json": me});
					}
				});
			} else {
				console.log("exists");
			}
		});
	} else {
		var callbacks = [];
		callbacks.push(end);
		callbacks.push(homepage);
		header("", callbacks, {"res": res});
	}
});

homepage = function(input, callbacks, args) {
	var page = input;

	page += add("<div class='search'>");
	page += add("<h4>See your research impact:</h4>");
	page += add("<form method='get'> <input type='text' name='author' placeholder='Your Name'/> <button type='submit'>Enter</button></form>");

	page += add("</div>");

	var callback = callbacks.pop();
	return callback(page, callbacks, args);
};

results = function(input, callbacks, args) {
	var json = args["json"];

	var page = input;

	page += add("<div class='results'>");

	if (json === null) {
		page += add("<h2>Sorry, we couldn't find you :(</h2>");
	} else {
		var name = json["FirstName"] + " " + json["MiddleName"] + " " + json["LastName"];
		var id = json["ID"];
		var affiliation = json["Affiliation"] !== null ? json["Affiliation"]["Name"] : "";
		var citeCount = json["CitationCount"];
		var pubCount = json["PublicationCount"];
		var h_index = json["HIndex"];
		var g_index = json["GIndex"];

		page += add("<h2>" + name + "<small> &mdash; " +  affiliation + "</small> </h2>");
		page += add("<h3>Total Citation Count: " + citeCount + "</h3>");
		page += add("<h3>Total Publication Count: " + pubCount + "</h3>");
		page += add("<h3>Average Citations per Publication: " + (citeCount/pubCount).toFixed(1) + "</h3>");
		page += add("<h3>H-Index: <div class='circle'>" + h_index + "</div></h3>");
		page += add("<h3>G-Index: <div class='circle'>" + g_index + "</div></h3>");

		l_index(1, pubCount, id, 0);
	}

	page += add("</div>");

	var callback = callbacks.pop();
	return callback(page, callbacks, args);
};

header = function(input, callbacks, args) {
	fs.readFile("static/header.html", "utf8" , function(err, data) {
		if (!err) {
			var callback = callbacks.pop();
			return callback(input + data, callbacks, args);
		}
	});
};

end = function(input, callbacks, args) {
	var page = input;
	page += add("</html>");

	var res = args["res"];
	res.send(page);
};

add = function(string) {
	return string + os.EOL;
};

fs.readFile("API key.txt", "utf8" , function(err, data) {
	key = data;

	server = app.listen(3000);
});

app.get("/l-index", function(req, res) {
	var id = req.query["id"];
	var max = req.query["max"];

	if (id && max) {
		l_index(1, max, id, 0);
	}
});

l_index = function(i, max, id, sum) {
	console.log(i + " / " + max);
	if (i <= max) {
		var url = "http://academic.research.microsoft.com/json.svc/search?";

		url += "AppID=" + key;
		url += "&AuthorID=" + id;

		url += "&ResultObjects=" + "publication";
		url += "&PublicationContent=" + "title,author";
		url += "&StartIdx=" + i;
		url += "&EndIdx=" + i;

		request(url, function (error, response, body) {
			var err = false;

			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				if (json["d"]["Publication"]["Result"] !== null) {
					var pub = json["d"]["Publication"]["Result"][0];
					var c = pub["CitationCount"];
					var a = Object.keys(pub["Author"]).length;
					var y = pub["Year"] !== 0 ? new Date().getFullYear() - pub["Year"] + 1 : 1;

					sum += c / (a * y);
				} else {
					err = true;
				}
			} else {
				err = true;
			}

			if (err) {
				console.log("error");
				setTimeout((function() {l_index(i, max, id, sum)})(i), 300);
			} else {
				setTimeout((function() {l_index(i + 1, max, id, sum)})(i), 300);
			}
		});
	} else {
		console.log(Math.log(sum * 3) + 1);
	}
};

app.use('/static', express.static('static'));