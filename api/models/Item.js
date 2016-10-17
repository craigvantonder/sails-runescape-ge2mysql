/**
 * Item.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  // http://sailsjs.org/documentation/concepts/models-and-orm/model-settings
  autoCreatedAt: false,
  autoUpdatedAt: false,
  migrate: 'create', // don't drop the categories, added them manually
  tableName: 'item',
  autoPK: false,

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true
    },
    category: {
      type: 'integer',
      model: 'category'
    },
    alpha_id: { type: 'integer' },
    icons: {
      collection: 'icon',
      via: 'item_id'
    },
    icon: { type: 'string' },
    icon_large: { type: 'string' },
    typeIcon: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    members: { type: 'string' },
    current_trend: { type: 'string' },
    current_price: { type: 'string' },
    today_trend: { type: 'string' },
    today_price: { type: 'string' },
    day30_trend: { type: 'string' },
    day30_price: { type: 'string' },
    day90_trend: { type: 'string' },
    day90_price: { type: 'string' },
    day180_trend: { type: 'string' },
    day180_price: { type: 'string' }
  }
};

