const mongoose = require('mongoose');
let schema = require('./permission.schema').clone();

schema.statics.maxLevel = function maxLevel(levels){
	if(hasApplicationLevel(levels)){
		return "application"
	}
	if(hasOrganizationLevel(levels)){
		return "organization"
	}
	if(hasGroupLevel(levels)){
		return "group"
	}
	if(hasUserLevel(levels)){
		return "user"
	}
}
schema.statics.createPermission = async function(req){
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    return await data.save();
}
function hasApplicationLevel(levels){
	return levels.indexOf("application")>-1;
}
function hasOrganizationLevel(levels){
	return levels.indexOf("organization")>-1;
}
function hasGroupLevel(levels){
	return levels.indexOf("group")>-1;
}
function hasUserLevel(levels){
	return levels.indexOf("user")>-1;
}
const Model = mongoose.model('Permission', schema);

module.exports = Model;