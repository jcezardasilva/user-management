const mongoose = require('mongoose');
const LEVELS = ["application", "organization", "group", "user"];

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Permissao
 * @property {String} id identificação única da permissão
 * @property {String} name nome da permissão
 * @property {String} description descrição da permissão
 * @property {String} level nível de acesso da permissão ["aplication","organization","group"]
 * @property {String} resourceId ID do recurso a ser tratado pela permissão
 * @property {String[]} roles objetos de acesso da permissão
 * @property {DataField} agentProperties critérios de permissão do Agente do recurso
 * @property {DataField} targetProperties critérios de permissão do Alvo do recurso
 * @property {Date} date date de criação da permissão
 */
let schema = new mongoose.Schema({
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
	description: {
		type: String,
		unique: true,
		required: true
	},
	level: {
		type: String,
		enum: LEVELS
	},
	resourceId: {
		type: String,
		required: true
	},
	roles: {
		type: [String]
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'crm.permissions'
});
module.exports = schema;