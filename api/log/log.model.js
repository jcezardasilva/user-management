const mongoose = require('mongoose');
let schema = require('./log.schema').clone();

const Model = mongoose.model('Log', schema);
module.exports = Model;