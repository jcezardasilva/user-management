const mongoose = require('mongoose');
let schema = require('./authentication.schema').clone();
schema.index({
	id: 1
}, {
	unique: true
})
const Model = mongoose.model('Authentication', schema);
module.exports = Model;