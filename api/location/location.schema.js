const Schema = require('mongoose').Schema;
/**
 * Esquema de dados utilizado para gerenciar endereços em outras entidades.
 * @memberof CRM
 * @name Endereco
 * @property {Striing} [name] nome do endereço
 * @property {string} [cep] cep do endereço
 * @property {string} [address] logradouro do endereço
 * @property {string} [number] numero do endereço
 * @property {string} [complement] complemento do endereço
 * @property {string} [district] bairro do endereço
 * @property {string} [city] cidade do endereço 
 * @property {string} [state] UF do endereço 
 */
const SchemaLocation = new Schema({
	name: {
		type: String
	},
	cep: {
		type: String
	},
	address: {
		type: String
	},
	number: {
		type: String
	},
	complement: {
		type: String
	},
	district: {
		type: String
	},
	city: {
		type: String
	},
	state: {
		type: String
	}
})

module.exports = SchemaLocation;