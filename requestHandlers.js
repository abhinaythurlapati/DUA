var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var security = require("./encryption.js"); 
var database = require("./databaseConnection.js");





//adding an index to the mobile number of user in logs
var coll = "logs";
var db1 = database.db1();

var getlogs = db1.collection(coll);
getlogs.ensureIndex([{"IMEI" : 1 }, {unique : true}], function(err,docs){
	if(err){
		console.log(err);
	}

});


function sync_data(response,request) {
	if (request.method == 'POST') {

		console.log("Request handler 'sync_data' was called.");
		var body = '';
		request.on('data', function (data) {
			body += data;
			// Too much POST data, kill the connection!
			if (body.length > 1e6){request.connection.destroy();}
		});


		// once receiving message is finished 
		request.on('end', function () {
			// decrypting the message received	

			//body = security.decipher(body);
			// parsing the decrypted message
			var received = JSON.parse(body);
			console.log(received);
			// add time stamp when server received the data
			for ( var i = 0; i< received.length;i++) {
				console.log("hello world");
				 received[i].server_synctime = new Date().toISOString()
			}
			var coll = "logs";
			var getlogs = db1.collection(coll);
			
			
			getlogs.insert(received,function(err){
				if(err){
					console.log(err);
				}
				else{
					console.log("successfully synced data " + received.number); 
					response.write("successfully synced data " + received.number);
					response.end();	
				}
			});



			/*getlogs.update({"number" : received.number},{$push : { data:{$each: received.data }}},function(err,status){
				if(err){
					console.log(err);								
				}
				else{
					console.log("successfully synced data " + received.number); 
					response.write("successfully synced data " + received.number);
					response.end();	
				}
			});*/
		});
	}
}



/*
function register(response, request) {
	if (request.method == 'POST') {
		var body = '';
		request.on('data', function (data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6)
				request.connection.destroy();
		});
		request.on('end', function () {

			//body = security.decipher(body);

			console.log(body);


			var post = JSON.parse(body);
			console.log("posted = ", post);
			var coll =  "logs";
			var getlogs = db1.collection(coll);
			getlogs.find({"number" : post.number}, function(err,docs){
				if(err){
					console.log(err);
				}
				else {

					console.log("haha");
					console.log(docs);
					if(docs.length == 0)
					{

						getlogs.save(post, function(err,data){
							if(err){
								console.log(err);
							}
							else {

								console.log("successfully registered " + post.number + " please login again");
								response.write(post.number + " Registerd Successfully");
								response.end();
							}
						});

					}
					else
					{
						console.log(post.number + " already registered");
						response.write(post.number  + " already registered");
						response.end();
					}
				}
			});
		});

	}
}
 */

//making the functions accessable
exports.sync_data = sync_data;
//exports.register = register;	


/*
db.schedule_collection.find({
	  start_date: { '$gte': new Date(2012, 01, 03, 8, 30) }
	})
*/

//below are only testing puropes

//curl -X POST -d '[{ "IMEI" : "i" : 286796585, "txcell" : 0, "rxcell" : 0, "date" : "2015T18+05:30" }]' http://localhost:8888/sync_data

//below are obsolete
//test the functionality by
//curl -X POST -d '{"operator" : "Tata Docomo GSM","number" : "8904765965", "data" : [{ "timestamp" : "30/10/2015" , "2G" : "15","3G" : 10,"4G" : "3", "wifi" : "20"}]}' http://localhost:8888/sync_data

//test for registration
//curl -X POST -d '{"operator" : "Tata Docomo GSM","number" : "8904765965","data" : []}' http://localhost:8888/register



