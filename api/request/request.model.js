const mongoose = require('mongoose');
let schema = require('./request.schema').clone();

/**
 * Modelo de dados de requisição HTTP
 * @memberof Requisicao
 * @public
 */
const Model = mongoose.model('Requests', schema);

module.exports = Model;