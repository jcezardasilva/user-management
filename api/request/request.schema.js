const Schema = require('mongoose').Schema;

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Requisicao
 * @property {String} id identificação única do registro de requisição
 * @property {String} requestId identificação única da requisição
 * @property {String} url url da requisição
 * @property {String} [userId] identificação do usuário que realizou a requisição
 * @property {object} origin dados capturados sobre a origem da requisição
 * @property {Date} date data de registro da requisição
 */
let schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	requestId: {
		type: String
	},
	url: {
		type: String,
		required: true
	},
	userId: {
		type: String
	},
	origin: {
		type: Schema.Types.Mixed
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'requests'
});
module.exports = schema;