var Schema = require('mongoose').Schema;

/**
 * Esquema para associação de permissões e condições de permissão a grupos de usuário
 * @memberof CRM.Grupo
 * @property {String} permissionId identificação única da permissão
 * @property {String} permissionConditionId identificação da condição de permissão
 * @property {Boolean} [isActive] indica se a permissão está ativa ou não
 */
const Permission = new Schema({
	permissionId: {
		type: String,
		required: true
	},
	permissionConditionId: {
		type: String
	},
	isActive: {
		type: Boolean
	}
},{ _id : false })

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Grupo
 * @property {String} id identificação única do grupo
 * @property {String} name nome do grupo
 * @property {String} [description] descrição do grupo
 * @property {String} organizationId ID da empresa a que o grupo pertence
 * @property {Object[]} [permissions] lista de permissões do grupo para recursos do sistema
 * @property {Date} date data de criação do grupo
 */
let schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	organizationId: {
		type: String,
		required: true
	},
	permissions: {
		type: [Permission],
		required: true
	},
	date: {
		type: Date,
		required: true
	}
}, {
	collection: 'groups'
});

module.exports = schema;