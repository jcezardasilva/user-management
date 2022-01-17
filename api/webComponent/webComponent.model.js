const mongoose = require('mongoose');
let schema = require('./webComponent.schema').clone();
schema.index({
	id: 1
}, {
	unique: true
})
const Model = mongoose.model('WebComponent', schema);
module.exports = Model;