const mongoose = require('mongoose');
let schema = require('./webauthn.schema').clone();
schema.index({
	id: 1
}, {
	unique: true
})
const Model = mongoose.model('Webauthn', schema);
module.exports = Model;