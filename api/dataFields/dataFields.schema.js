const Schema = require('mongoose').Schema;
const TYPES = require('../common/common.controller').data.TYPES;
/**
 * @summary Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Comum.Dados
 * @property {String} id identificação única do campo de dados
 * @property {String[]} children identificação de campos de dados filhos, quando dentro de uma árvore de campos.
 * @property {String} name nome campo de dados
 * @property {*} value valor do campo de dados
 * @property {String} label nome de exibição para o campo de dados
 * @property {String} dataType tipo de dados do campo definidos no objeto "Comum.Data.TYPES"
 * 
 */
const schema = new Schema({
    id: {
		type: String,
		required: true
	},
	children: {
		type: [Schema.Types.Mixed],
	},
	name: {
		type: String,
		required: true
	},
	label: {
		type: String,
		required: true
	},
	dataType: {
		type: String,
		enum: TYPES,
		required: true
	},
	value: {
		type: Schema.Types.Mixed
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;