const Schema = require('mongoose').Schema;

const Extra = require('../extraFields/extraFields.model');

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Content.Notification.Subscription
 * @property {String} id identificação única da subscrição
 * @property {String} content id do usuário ou grupo destinatário
 * @property {Buffer} attachment anexo da mensagem em formato binário
 * @property {Object} info objeto com informações sobre envio, recebimento e leitura da mensagem
 * @property {Date} date data de criação da mensagem
 * @property {Extra[]} [extra] lista de campos extra da mensagem
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	subscription: {
		type: Schema.Types.Mixed,
		required: true
	},
	userAgent: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	},
	extra: {
		type: [Extra]
	}
}, {
	collection: 'content.notifications.subscription'
})


module.exports = schema;