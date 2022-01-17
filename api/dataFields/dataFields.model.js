const mongoose = require('mongoose');
const schema = require('./dataFields.schema').clone();

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
const Model = mongoose.model("common.dataFields",schema);

module.exports = Model;