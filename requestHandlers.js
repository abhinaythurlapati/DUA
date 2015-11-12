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

function sync_data(response,request){
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
			body = security.decipher(body);
			// parsing the decrypted message
			var received = JSON.parse(body);
			
			//specifying collection for querying
			var coll = "logs";
			var getlogs = db1.collection(coll);
			
			
			getlogs.find({"IMEI" : received.IMEI},function(err,docs){
				if(err){
					console.log(err);
				}
				else{
					if(docs.length == 0){
						// if length of docs is 0 it means user is new
						// add the document as it is by changing the date to Dateobject and add server time
						console.log("hello 1");
						
						for ( var i = 0; i< received.data.length;i++) {
							 serverDate = new Date();
							 //offset = date.getTimezoneOffset() * 60000;
							 //date = new Date(date.valueOf() - offset);
							 console.log(received.data[i].date);
							 received.data[i].date = new Date(received.data[i].date);
							 console.log(received.data[i].date);
							 console.log(received.data[i].date.toISOString());
							 received.data[i].server_synctime = serverDate;
							 //received[i].server_synctime = date.toISOString();
							 received.data[i].ip = request.connection.remoteAddress;
						}
						
						getlogs.insert(received,function(err,doc){
							if(err){
								console.log(err);
								response.write(0);
								response.end();
							}
							else{
								
								if(doc.data.length != 0 ){
									//increment the id to current length of the document
									getlogs.update({"IMEI": received.IMEI },{ $inc: { id : doc.data.length-1 } },function(err){
										if(err){
												console.log(err);
											}
										else{
												console.log("hello2");
												var temp = received.id+doc.data.length-1;
												temp+= '';
												console.log("sending current database id");
												console.log(temp);
												response.write(temp); //send current count
												console.log("successfully synced data " + request.connection.remoteAddress);
												response.end();   // close connection
												
											}										
									}); // end update 
								}   //end if 
							  }	 //end else
						}); // end insert query
					}// end if condition
					else{
						// get current id 
						console.log("in else");
						getlogs.aggregate([{$match : {"IMEI" : received.IMEI}},{$project : { "_id":0, "id" : 1 } }],function(err,docid){
							if(err){
								console.log(err);
							}
							else{
								//compare database id with received id
								// if received_id < current_id means response message to client is lost and it is not updated in their client
									if(received.id < docid[0].id){
									var temp = docid[0].id;
									temp+= '';
									console.log("need to update client database");
									console.log(temp);
									response.write(temp);
									response.end();
								}
								else if (received.id-1 == docid[0].id){
									for ( var i = 0; i< received.data.length;i++) {
										 serverDate = new Date();
										 //offset = date.getTimezoneOffset() * 60000;
										 //date = new Date(date.valueOf() - offset);
										 received.data[i].date = new Date(received.data[i].date);
										 received.data[i].server_synctime = serverDate;
										 //received[i].server_synctime = date.toISOString();
										 received.data[i].ip = request.connection.remoteAddress;
									}
									//both are in synchronize and need to update database
									getlogs.update({"IMEI" : received.IMEI},{$push : { data:{$each: received.data }}},function(err){
										if(err){
											console.log(err);
											console.log("error in writing to database");
											var temp = docid[0].id;
											temp+= '';
											response.write(temp);
											response.end();
										}
										else{
											getlogs.update({"IMEI": received.IMEI },{ $inc: { id: received.data.length} },function(err,docs){
											if(err){
													console.log(err);
													//response.write(docid[0].id);
													//response.end();
												}
											else{
													console.log("hello3");
													console.log("current database id")
													console.log(docid[0].id + received.data.length);
													console.log("successfully synced data " + request.connection.remoteAddress);
													var temp = docid[0].id + received.data.length;
													temp+= '';
													console.log("sending current database id");
													console.log(temp);
													response.write(temp); //send current count
													response.end();   // close connection
													
												}
											
											}); //end update
										}
									});
									
								}
							}
						});
						
					}
				} //end first else
				
			}); // end getlogs find
		}); //end request on

	} //end if
} //end sync data





/*
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

			body = security.decipher(body);
			// parsing the decrypted message
			var received = JSON.parse(body);
			
			// add time stamp when server received the data
			for ( var i = 0; i< received.length;i++) {
				 serverDate = new Date();
				 //offset = date.getTimezoneOffset() * 60000;
				 //date = new Date(date.valueOf() - offset);
				 received[i].date = new Date(received[i].date);
				 received[i].server_synctime = serverDate;
				 //received[i].server_synctime = date.toISOString();
				 received[i].ip = request.connection.remoteAddress;
			}
			console.log(received);
			var coll = "logs";
			var getlogs = db1.collection(coll);
			
			
			getlogs.insert(received,function(err){
				if(err){
					console.log(err);
				}
				else{
					
					console.log("successfully synced data " + request.connection.remoteAddress); 
					response.write("success");
					//console.log(response);
					response.end();	
				}
			});
*/
			

			/*getlogs.update({"IMEI" : received.IMEI},{$push : { data:{$each: received.data }}},function(err,status){
				if(err){
					console.log(err);								
				}
				else{
					getlogs.update({"IMEI": "received.IMEI" },{ $inc: { count: difference} },function(err,docs){
					if(err){
							console.log(err);
						}
					else{
							response.write(); //send current count
							response.end();   // close connection
							
						}
					
					})
				
					console.log("successfully synced data " + received.number); 
					response.write("successfully synced data " + received.number);
					response.end();	
				}
			});*/
	



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

//curl -X POST -d '[{"IMEI": '355463061449170',"txwifi": 4540,"rxwifi": 780,"txcell": 0,"rxcell": 0,"date": "2015-08-26T20:28:60.000+0530","ip": "192.168.43.110" }]' http://localhost:8888/sync_data

//below are obsolete
//test the functionality by
//curl -X POST -d '{"operator" : "Tata Docomo GSM","number" : "8904765965", "data" : [{ "timestamp" : "30/10/2015" , "2G" : "15","3G" : 10,"4G" : "3", "wifi" : "20"}]}' http://localhost:8888/sync_data

//test for registration
//curl -X POST -d '{"operator" : "Tata Docomo GSM","number" : "8904765965","data" : []}' http://localhost:8888/register



