var ConfigIniParser = require("config-ini-parser").ConfigIniParser;
fs = require('fs');

module.exports.readConfigFile = function(configFilename, callback) {

	var promise = new Promise(function(resolve, reject) {

		fs.readFile(configFilename, 'utf8', function(err, data) {
			if (err) {
				return console.log(err);
			}

			configParser = new ConfigIniParser();
			configParser.parse(data);

			// Returns an array of arrays (rather than a key-value object)
			configArray = configParser.items('IrisPlatform');

			// Convert to a key-value object
			configObj = new Map(configArray);

			resolve(configObj);
		});
	});


	return promise;
}