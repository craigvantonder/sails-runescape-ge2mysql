// Require sails
var Sails = require('sails');
// Load the sails environment
Sails.load(function(err, sails) {
  // Create the icons based on the items provided
  IconService.createAllIcons(false, function (err, result) {
    if(err) {
      sails.log.error('Failed to create icons.');
      sails.log.info(err);
      process.exit(1);
    }
    sails.log.info(result);
    process.exit(1);
  });
});