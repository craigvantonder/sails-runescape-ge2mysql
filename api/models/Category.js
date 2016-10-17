/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  // http://sailsjs.org/documentation/concepts/models-and-orm/model-settings
  autoCreatedAt: false,
  autoUpdatedAt: false,
  migrate: 'safe',
  tableName: 'category',

  attributes: {
    description: { type: 'string' },
    // Add a reference to Alpha
    alphas: {
      collection: 'alpha',
      via: 'category'
    },
    // Add a reference to Item
    items: {
      collection: 'item',
      via: 'category'
    }
  }
};

