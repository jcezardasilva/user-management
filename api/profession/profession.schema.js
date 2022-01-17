const Schema = require('mongoose').Schema;
const DataField = require('../dataFields/dataFields.schema').clone();
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Pedidos
 * @property {String} id identificação única da profissão
 * @property {object} properties propriedades customizadas da profissão
 * @property {String} [subform] formulário de campos específicos da profissão
 * @property {Date} date data de criação da profissão
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	properties: {
		type: [DataField],
		required: true
	},
	subform: {
		type: String
	},
	date: {
		type: Date,
		required: true
	}
},{
	collection: "crm.professions"
})

module.exports = schema;