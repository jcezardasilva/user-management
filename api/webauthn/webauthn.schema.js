const mongoose = require('mongoose');

/**
 * Esquema de dados utilizado para persistência em banco e transferência entre aplicações
 * @memberof CRM.Usuario.Autenticacao
 * @property {String} id identificação única da configuração de autenticação
 * @property {String} userId ID do usuário que fará autenticação via dispositivo seguro
 * @property {Date} date date de criação da ativação
 */
let schema = new mongoose.Schema({
	id: {
		type: String,
		required: true
    },
    webauthnId: {
        type: String
    },
	userId: {
		type: String,
		required: true
    },
    authenticators: {
        type: [mongoose.Schema.Types.Mixed]
	},
	registered: {
		type: Boolean
	},
	challenge: {
		type: String
	},
	isLogged: {
		type: Boolean
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = schema;