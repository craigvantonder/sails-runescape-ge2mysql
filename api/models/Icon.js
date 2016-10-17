/**
 * Icon.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  // http://sailsjs.org/documentation/concepts/models-and-orm/model-settings
  autoCreatedAt: false,
  autoUpdatedAt: false,
  migrate: 'create', // don't drop the categories, added them manually
  tableName: 'item_icon',

  attributes: {
    item_id: {
      type: 'integer',
      model: 'item'
    },
    status_code: { type: 'integer' },
    filename: { type: 'string' },
    large: { type: 'boolean' },
    icon:  { type: 'binary' }
  }
};

