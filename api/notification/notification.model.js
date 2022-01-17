const mongoose = require('mongoose');
const schema = require('./notification.schema').clone();

/**
 * modelo de dados de notificação
 * @memberof Content.Notification
 */
const Model = mongoose.model('Notification', schema);

module.exports = Model;