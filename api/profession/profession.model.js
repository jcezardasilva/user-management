const mongoose = require('mongoose');
let schema = require('./profession.schema').clone();
schema.index({
	id: 1
}, {
	unique: true
})
const Model = mongoose.model('Profissao', schema);
module.exports = Model;