const Schema = require('mongoose').Schema;
const DataField = require('../dataFields/dataFields.schema').clone();
const SchemaLocation = require('../location/location.schema').clone();
const SchemaProfession = new Schema({
	company: {
		type: String
	},
	office: {
		type: String
	},
	workLocation: {
		type: String
	},
	workStartMonth: {
		type: String
	},
	workStartYear: {
		type: String
	},
	workEndMonth: {
		type: String
	},
	workEndYear: {
		type: String
	},
	aboutWork: {
		type: String
	},
})
const SchemaEducation = new Schema({
	institute: {
		type: String
	},
	career: {
		type: String
	},
	monthStartClass: {
		type: String
	},
	yearStartClass: {
		type: String
	},
	monthEndClass: {
		type: String
	},
	yearEndClass: {
		type: String
	},
	aboutCareer: {
		type: String
	}
})
const SchemaDocument = new Schema({
	name: {
		type: String
	},
	value: {
		type: String
	}

})
/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Usuario.Perfil
 * @property {String} id identificação única do perfil com o idUser
 * @property {String} fullName nome completo do usuário
 * @property {String} birthday data de nascimento do usuário
 * @property {String} profession profissão do usuário
 * @property {String} aboutBio descrioção do usuário
 * @property {String} socialMedia mídias sociais do usuário
 * @property {String} contact informação de contato do usuário
 * @property {String} cpf cpf do usuário
 * @property {String} rg rg do usuário
 * @property {String} cep cep do usuário
 * @property {String} addres endereço do usuário
 * @property {String} number número do endereço do usuário
 * @property {String} complement complemento residencial do usuário
 * @property {String} district bairro do usuário
 * @property {String} city cidade do usuário
 * @property {String} state UF do usuário
 * @property {String} academicEducation dados academicos do usuário
 * @property {String} professionalExperience Experiência proficional do usuário
 * @property {Object[]} [properties] Propriedades personalizadas do perfil
 * @property {Date} date Data de criação do perfil
 * @property {Date} update Data de atualização do perfil
 */
let schema = new Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	photo: {
		type: String
	},
	fullName: {
		type: String
	},
	birthDay: {
		type: String
	},
	birthMonth: {
		type: String
	},
	birthYear: {
		type: String
	},
	profession: {
		type: String,
	},
	aboutBio: {
		type: String
	},

	linkedin: {
		type: String
	},
	twitter: {
		type: String
	},
	facebook: {
		type: String

	},
	contact: [{
		phone: {
			type: String
		},
		email: {
			type: String
		}
	}],

	cpf: {
		type: String
	},
	rg: {
		type: String
	},
	document: {
		type: [SchemaDocument]
	},
	location: {
		type: [SchemaLocation]
	},
	academicEducation: {
		type: [SchemaEducation]
	},
	professionalExperience: {
		type: [SchemaProfession]
	},
	properties: {
		type: [DataField]
	},
	date: {
		type: Date
	},
	update: {
		type: {
			Date
		}
	}
},{
	collection: "perfil"
})

module.exports = schema;