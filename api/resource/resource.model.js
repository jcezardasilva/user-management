const mongoose = require('mongoose');
const schema = require('./resource.schema').clone();
schema.index({
	name: 1
})
const Model = mongoose.model('Resource', schema);

module.exports = Model;