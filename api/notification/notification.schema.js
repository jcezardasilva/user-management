const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Content.Notification
 * @property {String} id identificação única da notificação
 * @property {String} from id do usuário que enviou a mensagem
 * @property {String} to id do usuário ou grupo destinatário
 * @property {String} content id do usuário ou grupo destinatário
 * @property {Buffer} attachment anexo da mensagem em formato binário
 * @property {Object} info objeto com informações sobre envio, recebimento e leitura da mensagem
 * @property {Date} date data de criação da mensagem
 * @property {Extra[]} [extra] lista de campos extra da mensagem
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
	info: {
		type: Schema.Types.Mixed,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'content.notifications'
})


module.exports = schema;