const mongoose = require('mongoose');
let schema = require('./triggers.schema').clone();
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
const Model = mongoose.model('Trigger', schema);
module.exports = Model;