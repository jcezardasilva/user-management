const Schema = require('mongoose').Schema;

/**
 * Esquema de dados para agendamento de gatilho
 * @memberof Relacionamento.Gatilhos
 * @property {date} date data da ocorrência
 * @property {date[]} recurrence lista de datas para repetição
 * @property {object} recurrenceOptions configurações da recorrência
 */
const SchedulingSchema = new Schema({
	date: {
		type: Date
	},
	recurrence:{
		type: [Date]
	},
	recurrenceOptions:{
		type: Schema.Types.Mixed
	}
})
/**
 * Esquema de dados para evento de gatilho
 * @memberof Relacionamento.Gatilhos
 * @property {String} groupId identificação única do grupo
 * @property {string} action ação realizada pelo usuário
 * @property {String} actionTime tempo da ação realizada
 * @property {String} actionTimeValue valor de tempo da ação realizada
 * @property {String} actionTimeValueInterval intervalo de tempo da ação realizada
 */
const EventSchema = new Schema({
	groupId: {
		type: String
	},
	action:{
		type: String
	},
	actionTime:{
		type: String
	},
	actionTimeValue:{
		type: Number
	},
	actionTimeValueInterval:{
		type: String
	}
})
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof Relacionamento.Gatilhos
 * @property {String} id identificação única do gatilho
 * @property {string} [organizationId] ID da organização a que o gatilho pertence
 * @property {String} name nome do gatilho
 * @property {String} description descrição do gatilho
 * @property {String} condition condição para disparo do gatilho
 * @property {object} [scheduling] configurações gatilho por agendamento
 * @property {object} [event] configurações gatilho por evento
 * @property {Boolean} isActive indica se o gatilho está ativo ou não
 * @property {Date} date date de criação do gatilho
 */
let schema = new Schema({
	id: {
		type: String,
		required: true
	},
	organizationId: {
		type: String
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	condition: {
		type: String,
		required: true
	},
	scheduling: {
		type: SchedulingSchema
	},
	event: {
		type: EventSchema
	},
	isActive: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;