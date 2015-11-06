var http = require("http");
var url = require("url");
var mongodb = require("mongojs");
var database = require("./databaseConnection.js");

	

function start(route, handle) {
		function onRequest(request, response) {
			var pathname = url.parse(request.url).pathname;
			console.log("Request for " + pathname + " received from ip: " +  request.connection.remoteAddress );
			route(handle, pathname, response, request);
		}	
	// creating http server and listen on 8888 port
	http.createServer(onRequest).listen(8888);
	console.log("Server has started.");
}
exports.start = start;
