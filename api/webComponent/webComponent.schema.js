const Schema = require('mongoose').Schema;
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.WebComponent
 * @property {String} id identificação única do video
 * @property {String} name nome do componente
 * @property {String} resourceId identificação do recurso associado ao componente
 * @property {Date} date data de envio do video
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	name: {
		type: Buffer
	},
	resourceId: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
},{
	collection: "crm.permissions.webcontents"
})

module.exports = schema;