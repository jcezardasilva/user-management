const mongoose = require('mongoose');
const DataField = require('../dataFields/dataFields.schema').clone();
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Organizacao
 * @property {String} id identificação única da organização
 * @property {String} name nome fantasia da organização
 * @property {Boolean} isDefault Indica se é uma organização padrão para cadastro
 * @property {Date} date date de criação da organização
 * @property {object[]} [properties] campos personalizados
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	image: {
		type: String
	},
	isDefault: {
		type: Boolean
	},
	isCoffee: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	},
	properties: {
		type: [DataField]
	}
})

module.exports = schema;