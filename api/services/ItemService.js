// Load restler module
var restler = require('restler');
// Load newer async module
var async = require('async');
// Load newer lodash module
var _ = require('lodash');

module.exports = {

  createAllItems: function (retry, callback) {
    // Get all alphas
    Alpha.find({
      where: {
        processed: false
      },
      sort: {
        category: 1, // desc
        letter: 1 // desc
      }
    }).exec(function (err, alphas) {
      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // If there are no alphas
      if (_.isEmpty(alphas)) {
        // Handle the error
        return callback('Alphas unavailable.');
      }

      // Truncate the table only if not a retry
      ItemService.truncateTable(retry, function (err) {
        // If there was an error
        if(err) {
          // Handle any errors within this process
          return callback(err);
        }

        // Itterate over the alphas and create the items
        ItemService.itterateAlphas(alphas, function (err, itemsCreatedForAllPages) {
          // If there was an error
          if(err) {
            // Handle the DoS protection
            if(_.hasIn(err, 'item_remove_error')) {
              // Remove any items that may have been created for some but not all pages of the last category/alpha
              ItemService.removeErrorItems(err, function (err) {
                // If there was an error
                if(err) {
                  // Handle any errors within this process
                  return callback(err);
                }

                // Retry the create process
                ItemService.createAllItems(true, function (err, result) {
                  // If there was an error
                  if(err) {
                    // Handle any errors within this process
                    return callback(err);
                  }

                  // Success
                  return callback(false, 'Items created for all '+alphas+' alphas: '+total_items_created);
                });
              });
            }
            // Handle any errors within this process
            else {
              return callback(err);
            }
          }
          // Success
          else {
            return callback(false, 'Items created for all '+alphas+' alphas: '+total_items_created);
          }
        });
      });
    });
  },

  // Truncates and reincrements the item table
  truncateTable: function (retry, callback) {
    // This is a retry
    if (retry) {
      // Return control flow
      return callback();
    }
    // If this is not a retry / fresh create
    else {
      // Notify system
      sails.log.warn('-> Truncating the `item` table.');
      // Truncate the item table
      Alpha.query('TRUNCATE `item`', function(err, queryResult) {
        // Handle any unexpected errors
        if(err) {
          return callback(err);
        }

        // Reset the auto increment value for the item table
        Alpha.query('ALTER TABLE `item` AUTO_INCREMENT = 1', function(err, queryResult) {
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

  // Remove any items that may have been created for some but not all pages of the last category/alpha
  removeErrorItems: function (err, callback) {
    // Notify system
    sails.log.info('Removing items with `category`: '+err.item_remove_category+'  and `alpha_id`: '+err.item_remove_alpha_id);
    // Define the query
    var query = 'DELETE FROM `item` WHERE `category` = '+err.item_remove_category+' AND `alpha_id` = '+err.item_remove_alpha_id;
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

  // Itterate over the alphas and create the items
  itterateAlphas: function (alphas, callback) {
    // While itterating over the alphas
    var during = function during(alpha, next) {
      // Create the items for this alpha
      ItemService.createItems(alpha, function (err, numberOfCreatedItems) {
        // Handle any unexpected errors
        if(err) {
          return next(err);
        }

        // Add to the amount of items created
        total_items_created += numberOfCreatedItems;

        // Wait 2 seconds before proceeding to the next alpha
        setTimeout(function() {
          // Return control flow
          return next();
        },2000);
      });
    };

    // After itterating over the alphas
    var done = function done(err, itemsCreatedForAllPages) {
      // Handle any unexpected errors
      if(err) {
        return callback(err);
      }

      // Return the amount of successes
      return callback(false, {
        alphas: alphas.length,
        total_items_created: total_items_created
      });
    };

    // Stores the number of items created
    var total_items_created = 0;

    // Itterate over the alphas, 1 at a time so as to not trigger DoS prevention
    async.eachSeries(alphas, during, done);
  },

  // Creates the item ids for the given category for this alpha and page
  createItems: function (alpha, callback) {
    // Test if the category input is an integer
    if (
      !Number.isInteger(parseInt(alpha.category, 10))
    ) {
      // Handle the error
      return callback('Invalid input.');
    }

    // If the alpha letter is a hash then it needs to be converted as per the api docs
    if (alpha.letter == '#') {
      alpha.letter = '%23';
    }

    // While itterating over the pages
    var during = function during(currentPage, next) {
      // Increment the current page as it starts at 0 and we need it to start at 1
      var actualPage = currentPage + 1;
      // Define the data source
      var url = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?category='+alpha.category+'&alpha='+alpha.letter+'&page='+actualPage;
      // Make the request
      restler.get(url, {
        // https://github.com/danwrong/restler#options
        parser: restler.parsers.json,
        timeout: 180000
      })
      // If it times out
      .on('timeout', function(ms) {
        // Handle the error
        return next('Request timed out');
      })
      // If the request completes, success/error
      .on('complete', function(jsonResponse) {
        // Handle the unexpected errors
        if (jsonResponse instanceof Error) {
          sails.log.error('Error:', jsonResponse.message);
          sails.log.info('Retrying in 60 seconds.');
          this.retry(60000); // try again after 60sec
        }
        // Success
        else {
          // If we did not get back a response then Jagex thinks we are DoSing?
          if (_.isNull(jsonResponse)) {
            // Enter cooldown period
            sails.log.warn('Seems like DoS protection just kicked in.');
            return next({
              item_remove_error: 'Seems like DoS protection just kicked in.',
              item_remove_category: alpha.category,
              item_remove_alpha_id: alpha.id
            });
          }

          // Open the storage object
          var items = [];
          // Loop through the alphas
          _.forEach(jsonResponse.items, function(itemValues, key) {
            // Convert the price to integers so that we can sort the values correctly
            var current_price_converted = ItemService.convertPrices(itemValues.current.price);
            var today_price_converted = ItemService.convertPrices(itemValues.today.price);
            // Marshall the information and add it to the array
            items.push({
              // Item ID is derived from the icons id paramter in icon / icon_large
              id: itemValues.id,
              category: alpha.category,
              alpha_id: alpha.id,
              icon: itemValues.icon,
              icon_large: itemValues.icon_large,
              name: itemValues.name,
              description: itemValues.description,
              members: itemValues.members,
              current_trend: itemValues.current.trend,
              current_price: current_price_converted,
              today_trend: itemValues.today.trend,
              today_price: today_price_converted
            });
          });

          // Store The alpha information for this category
          Item.create(items).exec(function (err, itemsCreatedForThisPage) {

            // Handle any unexpected errors
            if (err) {
              return next(err);
            }

            // Notify system
            sails.log.info(url+'  --->  Items Created: ('+itemsCreatedForThisPage.length+')');

            // Wait 2 seconds before proceeding to the next page
            setTimeout(function() {
              // Return control flow
              return next(false, { items_created: itemsCreatedForThisPage.length });
            },2000);
          });
        }
      });
    };

    // After itterating over the pages
    var done = function done(err, itemsCreatedForAllPages) {
      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // Stores the total number of items created for all pages of this alpha
      var total_items_created = 0;

      // Loop through the number of items created
      _.forEach(itemsCreatedForAllPages, function(itemsCreatedForAPage, key) {
        // Add to the amount of items created for all pages of this alpha
        total_items_created += itemsCreatedForAPage.items_created;
      });

      // Notify system
      sails.log.info('-> Items created for Alpha ('+alpha.letter+'): '+total_items_created);

      // Update the alphas processed value
      Alpha.update({id:alpha.id},{processed:true}).exec(function afterUpdate(err, updatedAlpha){
        // Handle any unexpected errors
        if (err) {
          return callback(err);
        }

        // We should now have all the items for all pages of this alpha
        return callback(false, {
          alphas: alpha.length,
          total_items_created: total_items_created
        });
      });
    };

    // Notify system
    sails.log.info('-> Now working on Category: '+alpha.category+'  with Alpha: '+alpha.letter+'  containing Pages: '+alpha.pages);

    // Itterate over the pages, 1 at a time so as to not trigger DoS prevention
    async.timesSeries(alpha.pages, during, done);
  },

  convertPrices: function (price) {
    // Open storage variable
    var converted_price = price;
    // If the price is in thousands
    if (_.endsWith(price, 'k')) {
      converted_price = parseFloat(price) * 1000;
    }
    // If the price is in millions
    if (_.endsWith(price, 'm') * 1000000) {
      converted_price = parseFloat(price) * 1000000;
    }
    // If the price is in billions
    if (_.endsWith(price, 'b') * 1000000000) {
      converted_price = parseFloat(price) * 1000000000;
    }
    // Return the price of if applicable, the converted price
    return converted_price;
  }
};