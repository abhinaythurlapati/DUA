var crypto = require('crypto');
var secretKey = "qazxswedc";
exports.cipher = function(datatosend){
	var cipher = crypto.createCipher('aes-128-ecb',secretKey);
	datatosend = cipher.update(JSON.stringify(datatosend),'utf8','hex') + cipher.final('hex');
	return datatosend;
}
exports.decipher = function(body){
	var decipher =  crypto.createDecipher('aes-128-ecb',secretKey); 
	body = decipher.update(body,'hex','utf8') + decipher.final('utf8');
	return body; 
}
