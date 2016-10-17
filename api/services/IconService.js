// Load newer lodash module
var _ = require('lodash');
// Load request module
var request = require('request');
// Load path module
var path = require('path');

module.exports = {

  createAllIcons: function (retry, callback) {
    // Get all items
    Item.find({
      select: ['id', 'icon', 'icon_large', 'name']
    })
    .populate('icons')
    .sort('name ASC')
    .exec(function (err, items) {
      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // If there are no items
      if (_.isEmpty(items)) {
        // Handle the error
        return callback('Items unavailable.');
      }

      // If the item contains no linked icon information
      if (_.isEmpty(items.icons)) {

        // Truncate the table only if not a retry
        IconService.truncateTable(retry, function (err) {
          // If there was an error
          if(err) {
            // Handle any errors within this process
            return callback(err);
          }

          // While itterating over the items
          var during = function during(item, next) {
            // Create the icons for this item
            IconService.itterateIcons(item, function (err, numberOfCreatedIcons) {
              // Handle the errors
              if(err) {
                // Handle the DoS protection
                if(_.hasIn(err, 'icon_remove_error')) {
                  // Remove any icons that may have been created for some but not all pages of the last category/alpha
                  IconService.removeErrorIcons(err, function (err) {
                    // If there was an error
                    if(err) {
                      // Handle any errors within this process
                      return callback(err);
                    }

                    // Retry the create process
                    IconService.createAllIcons(true, function (err, numberOfCreatedIcons) {
                      // If there was an error
                      if(err) {
                        // Handle any errors within this process
                        return callback(err);
                      }

                      // Respond with the amount of icons created
                      return callback(false, 'Icons stored for all '+items.length+' items: '+total_icons_created);
                    });
                  });
                }
                // Handle any other errors within this process
                else {
                  // Return it
                  return next(err);
                }
              }

              // Add to the amount of itemsd created
              total_icons_created += numberOfCreatedIcons;

              // Return control flow
              return next();
            });
          };

          // After itterating over the items
          var done = function done(err, iconsCreatedForAllItems) {
            // If there was an error
            if(err) {
              // Handle any errors within this process
              return callback(err);
            }

            // Respond with the amount of icons created
            return callback(false, 'Icons stored for all '+items.length+' items: '+total_icons_created);
          };

          // Stores the number of icons created
          var total_icons_created = 0;

          // Itterate over the icons, 1 at a time so as to not trigger DoS prevention
          async.eachSeries(items, during, done);

        });
      }
      // The item has linked icon information
      else {
        sails.log.info('-> Skipping item: '+item.name);
      }

    });
  },

  // Truncates and reincrements the item_icon table
  truncateTable: function (retry, callback) {
    // This is a retry
    if (retry) {
      // Return control flow
      return callback();
    }
    // If this is not a retry / fresh create
    else {
      // Notify system
      sails.log.warn('-> Truncating the `item_icon` table.');
      // Truncate the item table
      Alpha.query('TRUNCATE `item_icon`', function(err, queryResult) {
        // Handle any unexpected errors
        if(err) {
          return callback(err);
        }

        // Reset the auto increment value for the item table
        Alpha.query('ALTER TABLE `item_icon` AUTO_INCREMENT = 1', function(err, queryResult) {
          // Handle any unexpected errors
          if(err) {
            return callback(err);
          }

          // Return control flow
          return callback();
        });
      });
    }
  },

  // Remove any icons that may not have had both the small and large icon versions created
  removeErrorIcons: function (err, callback) {
    // Notify system
    sails.log.info('Removing icons with `item_id`: '+err.icon_remove_item_id);
    // Define the query
    var query = 'DELETE FROM `item_icon` WHERE `item_id` = '+err.icon_remove_item_id;
    // Truncate the item table
    Alpha.query(query, function(err, queryResult) {
      // Handle any unexpected errors
      if(err) {
        return callback(err);
      }

      // Notify system
      sails.log.info('Retrying in 3 minutes...');
      // Cooldown for 3 minutes before proceeding with the next page request
      setTimeout(function() {
        // Notify system
        sails.log.info('Attempting to retry...');
        // Return control flow
        return callback();
      },180000);
    });
  },

  // Creates and itterationi to create the small and large versions of the icons
  itterateIcons: function (item, callback) {

    // While itterating over the icons
    var during = function during(currentItteration, next) {
      // First irreration accounts for small icon
      if (currentItteration == 0) {
        var iconToDownload = item.icon;
      }
      // Second irreration accounts for large icon
      else if (currentItteration == 1) {
        var iconToDownload= item.icon_large;
      }

      // simple HTTP GET request for the image URL
      request.get({url: iconToDownload, encoding: 'binary'}, function (err, response, body) {
        // Handle any unexcepted errors
        if (err) {
          return next(err);
        }

        // If we did not get back a response then Jagex thinks we are DoSing?
        if (_.isNull(response)) {
          // Notify system
          sails.log.warn('Seems like DoS protection just kicked in.');
          // Wait 3 mins and try again??????
          return next({
            icon_remove_error: 'Seems like DoS protection just kicked in.',
            icon_remove_item_id: item.id
          });
        }
        // We did get a response back
        else {

          // If we got 4xx back
          if (response.statusCode >= 400) {
            // Form the input
            var icon = {
              item_id: path.basename(iconToDownload).split('=')[1],
              status_code: response.statusCode,
              filename: path.basename(iconToDownload).split('?')[0],
              large: (currentItteration == 1) ? true : false,
              icon: null
            };
            // Save error to database
            IconService.saveIcon(icon, function(err, createdIcon) {
              // Handle any unexpected errors
              if(err) {
                return next(err);
              }
              // Wait 2 seconds before proceeding to the next icon
              //setTimeout(function() {
                // Return control flow
                return next(false, createdIcon);
              //},2000);
            });
          }

          // Form the input
          var icon = {
            item_id: path.basename(iconToDownload).split('=')[1],
            status_code: response.statusCode,
            filename: path.basename(iconToDownload).split('?')[0],
            large: (currentItteration == 1) ? true : false,
            icon: body
          };
          // Save success to database
          IconService.saveIcon(icon, function(err, createdIcon) {
            // Handle any unexpected errors
            if(err) {
              return next(err);
            }
            // Wait 2 seconds before proceeding to the next icon
            //setTimeout(function() {
              // Return control flow
              return next(false, createdIcon);
            //},2000);
          });
        }

      });

    };

    // After itterating over the icons
    var done = function done(err, iconsCreatedForThisItem) {
      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // Notify system
      sails.log.info('-> Icons Created: ('+iconsCreatedForThisItem.length+')');

      // Return control flow
      return callback(false, iconsCreatedForThisItem.length);
    };

    // Notify system
    sails.log.info('-> Now working on Item: '+item.name);

    // Itterate over the pages, 1 at a time so as to not trigger DoS prevention
    async.timesSeries(2, during, done);
  },

  saveIcon: function (icon, callback) {
    // Save this icon to the database
    Icon.create(icon).exec(function afterwards(err, createdIcon) {
      // Handle any unexpected errors
      if(err) {
        return callback(err);
      }
      // Return the created item
      return callback(false, createdIcon);
    });
  }
};