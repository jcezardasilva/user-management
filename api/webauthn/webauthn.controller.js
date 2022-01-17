const utils = require('./webauthn.utils');
const config = require('../../config');
const base64url = require('base64url');

const Model = require('./webauthn.model');
const UserModel = require('../user/user.model');

/**
 * Autenticação de usuário via protocolo de segurança do dispositivo
 * @namespace CRM.Usuario.Autenticacao
 * @memberof CRM.Usuario
 */
let obj = {};

/**
 * Informa se a autenticação via segurança do dispositivo está habilitada para o usuário.
 * @param {*} req 
 * @param {*} res 
 */
obj.isEnabled = async function (req, res) {
    try {
        let data = await Model.findOne({
            userId: req.user.id,
            "authenticators.credID": {
                "$exists": 1
            }
        });
        if (data) {
            return res.status(200).json({
                'status': 'ok',
                isEnabled: true,
                'message': 'Usuário com protocolo habilitado'
            });
        } else {
            return res.status(200).json({
                'status': 'ok',
                isEnabled: false,
                'message': 'Usuário com protocolo não habilitado.'
            });
        }

    } catch (error) {
        return res.json({
            'status': 'erro',
            'message': 'Falha ao recuperar dados do usuário'
        })
    }
}
/**
 * @summary Ativa a autenticação via segurança do dispositivo
 * @param {*} req 
 * @param {*} res 
 */
obj.register = async function (req, res) {
    if (!req.user) {
        return res.json({
            'status': 'erro',
            'message': 'Usuário não encontrado'
        })
    }

    let userData = await Model.findOne({
        userId: req.user.id,
        "authenticators.1": {
            "$exists": 1
        }
    });
    if (userData) {
        return res.json({
            'status': 'erro',
            'message': 'O usuário já tem biometria ativada.'
        });
    }

    let challengeMakeCred = utils.generateServerMakeCredRequest(req.user.email, req.user.email, req.user.id);
    req.app.locals.logger.info(`Challenge created:  ${challengeMakeCred.challenge}`);

    let id = req.app.locals.uniqid();
    let webauthnId = utils.randomBase64URLBuffer();
    let data = new Model({
        id: id,
        userId: req.user.id,
        webauthnId: webauthnId,
        authenticators: [],
        challenge: challengeMakeCred.challenge,
        date: new Date(new Date().toISOString())
    })
    await data.save();

    res.status(200).json(challengeMakeCred);
}
obj.delete = async function (req, res) {
    try {
        let result = await Model.deleteMany({
            userId: req.user.id
        })
        return res.status(200).json(result);
    } catch (error) {
        return res.json({
            'status': 'erro',
            'message': 'Falha ao recuperar dados do usuário'
        })
    }
}
/**
 * @summary Realiza a autenticação do usuário
 * @param {*} req 
 * @param {*} res 
 */
obj.login = async function (req, res) {
    if (!req.body || !req.body.email) {
        return res.json({
            'status': 'failed',
            'message': 'Informe o usuário para autenticação'
        })
    }

    let data = await UserModel.findOne({
        email: req.body.email
    });

    if (!data) {
        return res.json({
            'status': 'failed',
            'message': 'Usuário não encontrado.'
        })
    }
    let webauthnData = await Model.findOne({
        userId: data.id
    })
    if(!webauthnData){
        return res.status(400).json({
            errmsg: "Não foi possível utilizar a autenticação por biometria."
        })
    }
    let assertion = utils.generateServerGetAssertion(webauthnData.authenticators);

    req.app.locals.logger.info(`Challenge created:  ${assertion.challenge}`);

    webauthnData.challenge = assertion.challenge;
    await webauthnData.save();

    res.status(200).json(assertion);
}
/**
 * @summary Finaliza a sessão do usuário
 * @param {*} req 
 * @param {*} res 
 */
obj.logout = function (req, res) {
    if (!req.user) {
        return res.json({
            'status': 'erro',
            'message': 'Usuário não encontrado'
        })
    }

    res.status(200).json({
        'status': 'ok'
    })
}
/**
 * @summary Responde a um pedido de verificação de token
 * @param {*} req 
 * @param {*} res 
 */
obj.response = async function (req, res) {
    if (!req.body || !req.body.id ||
        !req.body.rawId || !req.body.response ||
        !req.body.type || req.body.type !== 'public-key') {
        return res.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })
    }

    let webauthnResp = req.body;
    let clientData = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));

    let data = await Model.findOne({
        challenge: clientData.challenge
    });
    if (!data) {
        req.app.locals.logger.error(`Challenges dont match. client: ${clientData.challenge}, session: ${data.challenge}`);
        return res.json({
            'status': 'failed',
            'message': 'Challenges don\'t match!'
        })
    }

    if (config.app.SERVER.indexOf(clientData.origin)===-1) {
        req.app.locals.logger.error(`Origins dont match. client: ${clientData.origin}, session: ${config.app.SERVER}`);
        return res.json({
            'status': 'failed',
            'message': 'Origins don\'t match!'
        })
    }

    let result;
    if (webauthnResp.response.attestationObject !== undefined) {
        /* This is create cred */
        result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);
        if (result.verified) {
            data.authenticators.push(result.authrInfo);
            data.registered = true;
            await data.save();
        }
    } else if (webauthnResp.response.authenticatorData !== undefined) {
        /* This is get assertion */
        result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, data.authenticators);
    } else {
        res.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }

    if (result && result.verified) {
        return await generateToken(req, res, data.userId);
    } else {
        return res.json({
            'status': 'failed',
            'message': 'Can not authenticate signature!'
        })
    }
}

/**
 * Gera um token de autenticação
 * @function login
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
 async function login(req, res) {
    if (req.user) {
        const userService = req.app.locals.userService;
        let token = await userService.login(req);

        req.app.locals.logger.info(`Token de acesso gerado com sucesso para o usuário ${req.user.id}`);
        return res.status(200).json({
            token: token
        });
    } else {
        req.app.locals.logger.error(`Autenticação inválida para o e-mail ${req.body.email}`);
        return res.status(400).json({
            errmsg: "autenticação inválida!"
        });
    }
}

/**
 * Gera token de autorização de acesso
 * @namespace CRM.Usuario.Autenticacao
 * @param {string} userId 
 */
async function generateToken(req, res, userId) {
    let userData = await UserModel.findOne({
        id: userId
    })
    if (userData) {
        req.user = userData;
        req.body.id = userData.id;
        req.body.email = userData.email;
        req.authenticationMode = "Fingerprint";
        return login(req,res);
    } else {
        return res.json({
            status: 'failed',
            message: "User not found."
        });
    }
}
module.exports = obj;