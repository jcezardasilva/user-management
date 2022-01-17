const Schema = require('mongoose').Schema;
const DataField = require('../dataFields/dataFields.schema').clone();

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Permissao
 * @property {String} id identificação única da permissão
 * @property {String} name nome da permissão
 * @property {String} description descrição do perfil de condições
 * @property {string} userDataFieldId ID da árvore de campos utilizada para filtros de usuário na permissão
 * @property {string} resourceDataFieldId ID da árvore de campos utilizada para filtros de recurso na permissão
 * @property {DataField} userProperties creitérios de usuário para a permissão
 * @property {*} resourceProperties critérios de recurso para a permissão
 */
let schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String
	},
	description: {
		type: String
	},
	userDataFieldId: {
		type: String
	},
	resourceDataFieldId: {
		type: String
	},
	userProperties: {
		type : [DataField]
	},
	resourceProperties: {
		type : [Schema.Types.Mixed]
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'crm.permissions.conditions'
});
module.exports = schema;