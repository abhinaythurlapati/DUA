var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var handle = {}
handle["/"] = requestHandlers.start;			// default route
handle["/sync_data"] = requestHandlers.sync_data;	// sync data to server
handle["/upload"] = requestHandlers.upload;		// dummy
handle["/show"] = requestHandlers.show;			// dummy	
handle["/register"] = requestHandlers.register;		// register for new users
server.start(router.route, handle);

//start - want plans
// upload - take plans
