const mongoose = require('mongoose');
const orgSchema = require('../organization/organization.schema').clone();
const Extra = require('../extraFields/extraFields.model').clone();
const DataField = require('../dataFields/dataFields.schema').clone();
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Usuario
 * @property {String} id identificação única do usuário
 * @property {String} email endereço de e-mail do usuário
 * @property {String} name nome completo do usuário
 * @property {String} [cpf] documento de identificação no cadastro de pessoas físicas
 * @property {String} phone Número de telefone do usuário
 * @property {String} password senha pessoal do usuário
 * @property {Object[]} groups lista de grupos que o usuário faz parte
 * @property {string} [organizationId] ID da organização a que o usuário pertence
 * @property {Object} organization organização a que o usuário pertence
 * @property {Date} date data de criação do usuário
 * @property {Boolean} [isConfirmed] indica se o cadastro foi confirmado por e-mail
 * @property {Boolean} [isActive] indica se o usuário está ativo ou não para uso
 * @property {Boolean} invite indica se o cadastro foi realizado por convite ou auto-cadastro
 * @property {Boolean} optin indica que o usuário concede acesso a seus dados
 * @property {Boolean} optout indica que o usuário revoga o acesso a seus dados
 * @property {Boolean} [serproCPFContent] Conteudo sobre CPF recuperado em base nacional SERPRO
 * @property {Boolean} [isCPFValid] Indica se um CPF é válido na base nacional SERPRO
 * @property {DataField} properties propriedades do usuário, seguindo o esquema de dados definido em "Comum.Dados.TYPES"
 * @property {Extra[]} [extra] lista de campos extra do usuário
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	cpf: {
		type: String
	},
	phone: {
		type: String
	},
	password: {
		type: String,
		required: true
	},
	groups: {
		type: [String],
		required: true
	},
	organizationId: {
		type: String
	},
	organization: {
		type: orgSchema,
		required: true
	},
	isActive: {
		type: Boolean
	},
	isConfirmed: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	},
	invite: {
		type: Boolean
	},
	termAccepted: {
		type: Boolean,
		required: true
	},
	truthfulInformation: {
		type: Boolean,
		required: true
	},
	optin: {
		type: Boolean,
		required: true
	},
	optout: {
		type: Boolean
	},
	serproCPFContent: {
		type: mongoose.Schema.Types.Mixed
	},
	isCPFValid: {
		type: Boolean
	},
	properties: {
		type : [DataField]
	},
	extra: {
		type: [Extra]
	}
}, {
	collection: 'users'
})

module.exports = schema;