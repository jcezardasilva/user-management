const mongoose = require('mongoose');
const encrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = 'verY$trongToken@zyAW@nMhUtzzyHJcbemiA6R4SXoTmEJA!G2Y2q6jY*QAg4oac';
const config = {
	salt: 10,
	sessionTimeout: 86400
}
const generatePassword = require('password-generator');
const Configuration = require('../configurations/configurations.model');
const Organization = require('../organization/organization.model');
const Group = require('../group/group.model');
const DataField = require('../dataFields/dataFields.model');
let schema = require('./user.schema').clone();

schema.index({
	id: 1
}, {
	unique: true
})
schema.index({
	email: 1
}, {
	unique: true
})
schema.index({
	cpf: 1
}, {
	unique: true,
	sparse: true
})

/**
 * Executa validações e processos antes de salvar o registro 
 */
schema.pre('save', async function (next) {
	let user = this;
	if (!user.isModified('password')) {
		next();
	} else {
		if (user.isPasswordStrong()) {
			try {
				let hash = await hashPassword(user.password);
				user._id = user.id;
				user.password = hash;
				next();
			} catch (error) {
				next(error);
			}
		} else {
			next(new Error("A senha não atende aos requisitos: 8 caracteres ou mais; letras maiúsculas e minúsculas; números; caracteres especiais."))
		}
	}
})

function isPasswordStrong(password) {
	/*
		/^
		(?=.*\d)              // deve conter ao menos um dígito
		(?=.*[a-z])           // deve conter ao menos uma letra minúscula
		(?=.*[A-Z])           // deve conter ao menos uma letra maiúscula
		(?=.*[!?$*&@#])         // deve conter ao menos um caractere especial
		[0-9a-zA-Z$*&@#]{8,}  // deve conter ao menos 8 dos caracteres mencionados
		$/
	*/
	return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!?$*&@#])[0-9a-zA-Z!?$*&@#]{8,}$/) || isStrongEnough(password);
}

function isStrongEnough(password) {
	let minLength = 12;
	let uppercaseMinCount = 3;
	let lowercaseMinCount = 3;
	let numberMinCount = 2;
	let specialMinCount = 2;
	const UPPERCASE_RE = /([A-Z])/g;
	const LOWERCASE_RE = /([a-z])/g;
	const NUMBER_RE = /([\d])/g;
	const SPECIAL_CHAR_RE = /([?-])/g;

	let uc = password.match(UPPERCASE_RE);
	let lc = password.match(LOWERCASE_RE);
	let n = password.match(NUMBER_RE);
	let sc = password.match(SPECIAL_CHAR_RE);
	return password.length >= minLength &&
		uc && uc.length >= uppercaseMinCount &&
		lc && lc.length >= lowercaseMinCount &&
		n && n.length >= numberMinCount &&
		sc && sc.length >= specialMinCount;
}

/**
 * Verifica a força de uma senha
 * 
 */
schema.methods.isPasswordStrong = function () {
	return isPasswordStrong(this.password);
}
/**
 * Gera uma senha automaticamente que atenda aos requisitos de segurança
 */
schema.statics.generatePassword = function () {
	var minLength = 12;
	var maxLength = 18;
	var password = "";
	var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
	while (!isPasswordStrong(password)) {
		password = generatePassword(randomLength, false, /[\w\d?-]/);
	}
	return password;
}

/**
 * Aplica criptografia à senha
 * @memberof CRM.Usuario.Autenticacao
 */
async function hashPassword(password) {
	return new Promise((resolve, reject) => {
		encrypt.hash(password, config.salt, (err, hash) => {
			if (err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	})
}
/**
 * Verifica se a senha informada está correta
 */
schema.methods.validatePassword = function (password, next) {
	encrypt.compare(password, this.password, (err, success) => next(success));
}
/**
 * Cria um token de autenticação
 */
schema.statics.createToken = function (data) {
	return jwt.sign({
		data: data
	}, secret, {
		expiresIn: config.sessionTimeout
	})
}
/**
 * Verifica se um token é válido
 */
schema.statics.validateToken = function (req, res, next) {
	let token = req.body.token || req.query.token || req.headers['authorization'] || "tokennãoencontrado";
	if (token === "tokennãoencontrado") {
		req.app.locals.logger.error(`Token não encontrado na requisição ${req.originalUrl}.`);
		return res.status(400).json({
			success: false,
			message: `Token não encontrado na requisição ${req.originalUrl}.`
		});
	}
	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			res.status(400).json({
				success: false,
				message: 'autenticação inválida!'
			})
		} else {
			req.decoded = decoded;
			next();
		}
	})
}
schema.statics.getOrganization = async function (organization) {
	return new Promise((resolve, reject) => {
		if (typeof organization === "string") {
			Organization.findOne({
				id: organization
			}, (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		} else {
			resolve(organization);
		}
	})
}
schema.statics.getDefaultOrganization = async function () {
	let defaultConfigs = await Configuration.findOne({
		name: "crm.user.register.defaults"
	})
	if (!defaultConfigs) {
		return null;
	}
	let query = {
		id: defaultConfigs.content.organizationId
	}
	return await Organization.findOne(query);
}
schema.statics.getDefaultGroup = async function () {
	let defaultConfigs = await Configuration.findOne({
		name: "crm.user.register.defaults"
	})
	if (!defaultConfigs) {
		return null;
	}
	let query = {
		id: defaultConfigs.content.groupId
	}
	return await Group.findOne(query);
}

schema.statics.getDataField = async function (id) {
	return await DataField.findOne({
		id: id
	});
}

schema.statics.getUser = async function(id){
    return await Model.findOne({
        id: id
    }, {
        id: 1,
        name: 1,
        email: 1,
        date: 1,
        phone: 1,
        groups: 1,
        organization: 1,
        properties: 1,
        extra: 1,
        isActive: 1
    })
}
schema.statics.getUsers = async function(query){
    return await Model.find(query, {
		id: 1,
		name: 1,
		email: 1,
		date: 1,
		phone: 1,
		groups: 1,
		organization: 1,
		properties: 1,
		extra: 1,
		isActive: 1
	})
}

/**
 * modelo de dados de usuário
 * @memberof CRM.Usuario
 */
const Model = mongoose.model('User', schema);

module.exports = Model;