/**
 * Alpha.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  // http://sailsjs.org/documentation/concepts/models-and-orm/model-settings
  autoCreatedAt: false,
  autoUpdatedAt: false,
  migrate: 'create',
  tableName: 'category_alpha',

  attributes: {
    category: {
      type: 'integer',
      model: 'category'
    },
    letter: { type: 'string' },
    items: { type: 'integer' },
    pages: { type: 'integer' },
    processed: {
      type: 'boolean',
      defaultsTo : false
    }
  }
};

