var mongoose = require('mongoose');
let schema = require('./group.schema').clone();

schema.index({ name: 1, organization: 1}, { unique: true });
const Model = mongoose.model('Group', schema);

module.exports = Model;