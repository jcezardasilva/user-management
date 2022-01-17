const Schema = require('mongoose').Schema;

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Comum.Configuracao
 * @property {String} id identificação única da permissão
 * @property {String} name nome da permissão
 * @property {string} [organizationId] ID da organização a que a configuração pertence
 * @property {String} description descrição da permissão
 * @property {Date} date date de criação da permissão
 * @property {Extra} extra campos chave/valor que definem a configuração
 */
let schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		unique: true,
		required: true
	},
	organizationId: {
		type: String
	},
	content: {
		type: Schema.Types.Mixed,
		required: true
	},
	description: {
		type: String,
		unique: true,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'configurations'
});

module.exports = schema;