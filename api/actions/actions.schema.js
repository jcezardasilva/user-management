const Schema = require('mongoose').Schema;

/**
 * Modelo de dados para configuração de mensagem enviada na ação
 * @property {String} [title] titulo da mensagem
 * @property {String} content conteúdo da mensagem
 * @property {String} [attachment] anexo da mensagem
 */
const ActionBodySchema = new Schema({
	title: {
		type : String
	},
	content: {
		type : String
	},
	attachment: {
		type: Buffer
	}
})
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Relacionamento.Acoes
 * @property {String} id identificação única da ação
 * @property {string} [organizationId] ID da organização a que a ação pertence
 * @property {String} name nome da ação
 * @property {String} triggerId id do gatilho que será utilizado para acionamento da ação
 * @property {Object} body conteúdo da ação que será executada
 * @property {string} groupId ID do grupo do usuário que será alvo da ação
 * @property {string} sender ID do usuário que será marcado como remetente da ação
 * @property {Boolean} isActive indica se a ação está ativa ou não
 * @property {Date} date date de criação da ação
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	organizationId: {
		type: String
	},
	groupId: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	triggerId: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: ["push message","chat message"],
		required: true
	},
	sender: {
		type: String
	},
	body: {
		type: ActionBodySchema
	},
	isActive: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;