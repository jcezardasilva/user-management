const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	number: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	}
})
module.exports = schema;