const mongoose = require('mongoose');
const Extra = require('../extraFields/extraFields.model');
const common = require('../common/common.controller');
const LEVELS = common.data.LEVELS;
const RESOURCE_TYPES = common.data.RESOURCE_TYPES;

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Permissao
 * @property {String} id identificação única do recurso
 * @property {String} name nome do recurso
 * @property {String} description descrição do recurso
 * @property {String} address descrição do recurso
 * @property {String} type tipo do recurso
 * @property {Date} date date de criação do recurso
 * @property {Extra} [extra] campos extra do recurso
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
	address: {
		type: String,
		required: true
	},
	level: {
		type: String,
		enum: LEVELS,
		required: true
	},
	type: {
		type: String,
		enum: RESOURCE_TYPES
	},
	date: {
		type: Date,
		required: true
	},
	extra: {
		type: [Extra]
	}
}, {
	collection: 'crm.permissions.resources'
});

module.exports = schema;