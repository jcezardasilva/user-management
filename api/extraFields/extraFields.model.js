const mongoose = require('mongoose');

const ExtraFields = new mongoose.Schema({
	key: {
		type: String,
		required: true
	},
	value: {
		type: String,
		required: true
	}
})

module.exports = ExtraFields;