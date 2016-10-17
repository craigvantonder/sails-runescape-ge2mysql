// Require sails
var Sails = require('sails');
// Load the sails environment
Sails.load(function(err, sails) {
  // Create the alphas for each category
  AlphaService.createAllAlphas(function (err, result) {
    if(err) {
      sails.log.error('Failed to create alphas.');
      sails.log.info(err);
      process.exit(1);
    }
    sails.log.info(result);
    // Create the items based on the alphas provided
    ItemService.createAllItems(false, function (err, result) {
      if(err) {
        sails.log.error('Failed to create items.');
        sails.log.info(err);
        process.exit(1);
      }
      sails.log.info(result);
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
  });
});