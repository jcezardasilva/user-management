const mongoose = require('mongoose');
const schema = require('./subscription.schema').clone();

schema.index({
	id: 1
}, {
	unique: true
})
/**
 * modelo de dados de subscrição
 * @memberof Content.Notification.Subscription
 */
const Model = mongoose.model('Subscription', schema);

module.exports = Model;