// Load restler module
var restler = require('restler');

module.exports = {

  createAllAlphas: function (callback) {
    // Get all categories
    Category.find().sort('id ASC').exec(function (err, categories){
      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // If there are no categories
      if (_.isEmpty(categories)) {
        // Handle the error
        return callback('Categories unavailable.');
      }

      // Notify system
      sails.log.warn('-> Truncating the `category_alpha` table.');

      // Truncate the category_alpha table
      Alpha.query('TRUNCATE `category_alpha`', function(err, queryResult) {
        // Handle any unexpected errors
        if(err) {
          return callback(err);
        }

        // Reset the auto increment value for the category_alpha table
        Alpha.query('ALTER TABLE `category_alpha` AUTO_INCREMENT = 1', function(err, queryResult) {
          // Handle any unexpected errors
          if(err) {
            return callback(err);
          }


          // While itterating over the categories
          var during = function during(category, next) {

            // Create the alphas for this category
            AlphaService.create(category.id, function (err, numberOfCreatedAlphas) {
              // Handle the error
              if(err) {
                // Return it
                return next(err);
              }

              // Add to the amount of alphas created
              total_alphas_created += numberOfCreatedAlphas;

              // Return control flow
              return next();
            });

          };

          // After itterating over the categories
          var done = function done(err, alphasCreatedForAllCategories) {
            // If there was an error
            if(err) {
              // Handle any errors within this process
              return callback(err);
            }

            // Respond with the amount of Alphas created
            return callback(false, 'Alphas created for all '+categories.length+' categories: '+total_alphas_created);
          };

          // Stores the number of alphas created
          var total_alphas_created = 0;

          // Itterate over the alphas, 1 at a time so as to not trigger DoS prevention
          async.eachSeries(categories, during, done);
        });
      });
    });
  },

  // Populates the alphas for the given category
  create: function (categoryId, callback) {
    // Test if the category input is an integer
    if (
      !Number.isInteger(parseInt(categoryId, 10))
    ) {
      // Handle the error
      return callback('Invalid input.');
    }

    // Get the category to test that it exists
    Category.count({id: categoryId}).exec(function countCB(err, foundCategories) {

      // Handle any unexpected errors
      if (err) {
        return callback(err);
      }

      // If the category has no alphas assigned
      if (foundCategories == 0) {
        // Handle the error
        return callback('Invalid category.');
      }

      // Define the data source
      var url = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?category='+categoryId;
      // Make the request
      restler.get(url, {
        // https://github.com/danwrong/restler#options
        parser: restler.parsers.json,
        timeout: 180000
      })
      // If it times out
      .on('timeout', function(ms) {
        // Handle the error
        callback('Request timed out');
      })
      // If the request completes, success/error
      .on('complete', function(jsonResponse) {

        // Handle the unexpected errors
        if (jsonResponse instanceof Error) {
          sails.log.warn('Error:', jsonResponse.message);
          sails.log.info('Retrying in 60 seconds.');
          this.retry(60000); // try again after 60sec
        }
        // Success
        else {
          // If we did not get back a response then Jagex thinks we are DoSing?
          if (_.isNull(jsonResponse)) {
            sails.log.warn('Seems like DoS protection just kicked in.');
            return callback('Seems like DoS protection just kicked in.');
          }

          // Open the storage object
          var alphas = [];
          // Loop through the alphas
          _.forEach(jsonResponse.alpha, function(alphaValues, key) {
            // Work out how many pages exist for this alpha
            var total_pages =  Math.ceil(alphaValues.items / 12);
            // If there is more than one page
            if (total_pages > 0) {
              //  Marshall the information and add it to the array
              alphas.push({
                category: categoryId,
                letter: alphaValues.letter,
                items: alphaValues.items,
                pages: total_pages
              });
            }
          });

          // Store The alpha information for this category
          Alpha.create(alphas).exec(function (err, alphasCreatedForThisCategory) {
            // Handle any unexpected errors
            if (err) {
              return callback(err);
            }

            // Notify system
            sails.log.info(url+'  --->  Alphas Created: ('+alphasCreatedForThisCategory.length+')');

            // Return control flow
            return callback(false, alphasCreatedForThisCategory.length);
          });
        }
      });
    });

  }
};