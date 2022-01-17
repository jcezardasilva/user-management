let mongoose = require('mongoose');
let schema = require('./perfil.schema').clone();

/**
 * modelo de dados de calendário
 * @memberof CRM.Perfil
 */
const Model = mongoose.model('Perfil', schema);

module.exports = Model;