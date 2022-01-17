const Schema = require('mongoose').Schema;

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Conteudo.Modelos
 * @property {String} id identificação única do modelo
 * @property {string} [organizationId] ID da organização a que o modelo pertence
 * @property {String} name nome do modelo
 * @property {String} content conteúdo do modelo
 * @property {String} isDefault indica se é um modelo padrão (genérico)
 * @property {object[]} [req.body.userProperties] Lista de propriedades de usuário que poderão ser utilizadas no conteúdo da mensagem
 * @property {String} type identificação do tipo de recurso ao qual o modelo se aplica: ["E-mail","SMS"]
 * @property {Date} date date de criação do modelo
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	organizationId: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	content: {
		type: Schema.Types.Mixed,
		required: true
	},
	type: {
		type: String,
		enum: ["E-mail","Chat"],
	},
	isDefault: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;