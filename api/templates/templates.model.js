const mongoose = require('mongoose');
let schema = require('./templates.schema').clone();
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
const Model = mongoose.model('Template', schema);
module.exports = Model;