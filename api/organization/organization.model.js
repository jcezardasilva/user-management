const mongoose = require('mongoose');
let schema = require('./organization.schema').clone();
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
const Model = mongoose.model('Organization', schema);
module.exports = Model;