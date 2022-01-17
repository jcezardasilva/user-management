const mongoose = require('mongoose');

/**
 * Esquema de dados para persistência de logs em banco de dados
 * @memberof Comum.Log
 * @property {String} id identificação única da organização
 * @property {String} content nome fantasia da organização
 * @property {Date} date date de criação da organização
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	level: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;