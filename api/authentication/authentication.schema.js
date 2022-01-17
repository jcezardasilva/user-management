const mongoose = require('mongoose');

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Usuario.Autenticacao
 * @property {String} id identificação única da autenticação
 * @property {string} [userId] ID do usuário autenticado
 * @property {Date} date data e hora em que a autenticação foi realizada
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	authenticationMode: {
        type: String,
        required: true,
		enum: ["Password","Fingerprint"]
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'authentication'
});
module.exports = schema;