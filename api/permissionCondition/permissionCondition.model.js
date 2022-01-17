const mongoose = require('mongoose');
let schema = require('./permissionCondition.schema').clone();

const Model = mongoose.model('PermissionConditions', schema);

module.exports = Model;