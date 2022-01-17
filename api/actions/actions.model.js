const mongoose = require('mongoose');
let schema = require('./actions.schema').clone();
schema.index({
	id: 1
}, {
	unique: true
})
schema.index({
	name: 1
}, {
	unique: true
})
const Model = mongoose.model('Action', schema);
module.exports = Model;