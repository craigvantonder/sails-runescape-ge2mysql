// Require sails
var Sails = require('sails');
// Load the sails environment
Sails.load(function(err, sails) {
  // Create the items based on the alphas provided
  ItemService.createAllItems(false, function (err, result) {
    if(err) {
      sails.log.error('Failed to create items.');
      sails.log.info(err);
      process.exit(1);
    }
    sails.log.info(result);
    process.exit(1);
  });
});