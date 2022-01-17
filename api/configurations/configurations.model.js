const mongoose = require('mongoose');
const schema = require('./configurations.schema').clone();

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

const Model = mongoose.model('Configuration', schema);
module.exports = Model;