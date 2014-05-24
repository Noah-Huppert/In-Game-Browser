var codein = require("node-codein");
console.log("-------------------------------------------------- Server Restart @ " + new Date() + " --------------------------------------------------");

var url = require('url');
var http = require('http');

var express = require('express');
var app = express();

var cheerio = require('cheerio');

var baseURL = {
	'url': 'http://localhost:3000/proxy/',
	'host': 'http://localhost:3000/'
};

app.get('/proxy/:url', function(req, res){
	var proxyURL = req.params.url;
	var proxyURLOptions = {
		host: url.parse(proxyURL).hostname,
	    path: url.parse(proxyURL).pathname
	};
	//For test http%3A%2F%2Fwww.google.com%0A

	http.get(proxyURLOptions, function(resp) {
		var data = '';
	  	resp.on('data', function (chunk) {
	      data += chunk;
	    });
	    resp.on("end", function() {
	    	var $ = cheerio.load(data);

	    	$('a').each(function(key, value){
	    		doLocal('href', { "key": key, "value": value });
	    	});

	    	function doLocal(index, data){
	    		var key = data.key;
	    		var value = data.value;
	    		var link = value.attribs[index];

	    		if(link.indexOf('http') == -1){//Link is local
	    			link = baseURL.host + link;
	    			console.log(link);
	    		}
	    	}

	      	res.write($.html());
	      	res.end();
	    });
	}).on('error', function(e) {
	  console.log("Got error: " + e.message + " -- " + proxyURL);
	  res.write("Internal Error");
	  res.end();
	});
});


//var port = Number(process.env.PORT || 5000);
var port = 3000;


app.listen(port);