const SubscriptionModel = require('./subscription.model');
const NotificationService = require('./notification.service');

let notificationService = new NotificationService();

/**
 * Módulo de notificações a usuários
 * @namespace Conteudo.Notificacao
 * @memberof Conteudo
 */
let obj = {};
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof Conteudo.Notificacao
 * @protected
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {object} data - Objeto de dados a ser enviado na resposta HTTP se não houver erros no tratamento
 */
function sendResponse(res, err, data) {
    if (err) {
        let errors = [];
        handleErrorUnsubscribed(err, errors);

        if (errors.length === 0) {
            errors = err;
        }
        return res.status(400).json(errors);
    } else {
        return res.status(200).json(data);
    }
}
/**
 * Verifica erro de subscrição expirada ou encerrada
 * @memberof Conteudo.Notificacao
 * @param {*} err 
 * @param {*} errors 
 */
function handleErrorUnsubscribed(err, errors) {
    if (err.body === "push subscription has unsubscribed or expired.") {
        errors.push("A subscrição está encerrada ou expirada.");
    }
}
/**
 * /notification/subscription
 * @summary subscreve um usuário para receber notificações
 * @memberof Conteudo.Notificacao
 * @function subscribe
 * @param {object} req  
 * @param {object} req.body 
 * @param {object} req.body.subscription 
 * @param {object} res 
 */
obj.subscribe = async function (req, res) {
    const userId = req.user.id;
    req.app.locals.logger.info(`Subscrevendo o usuário de ID ${req.user.id} para receber push.`);
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    req.body.userAgent = req.headers["user-agent"];
    const body = Object.assign(req.body,{
        userId: userId
    });
    let data = new SubscriptionModel(body);
    try {
        await data.save();
        req.app.locals.logger.info(`Sucesso na ativação de push para o usuário de ID ${userId}.`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha na ativação de push para o usuário de ID ${userId}. ${error}`);
        sendResponse(res, error, data);
    }
}
/**
 * @summary Remove uma subscrição de push para um usuário
 * @memberof Conteudo.Notificacao
 * @param {object} req 
 * @param {object} res 
 */
obj.unsubscribe = async function (req, res) {
    req.app.locals.logger.info(`Removendo a subscrição de push para o usuário de ID ${req.body.userId}.`);
    try {
        let data = await SubscriptionModel.deleteOne({
            userId: req.body.userId
        });
        req.app.locals.logger.info(`Sucesso ao remover a subscrição de push para o usuário de ID ${req.body.userId}.`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao remover a subscrição de push para o usuário de ID ${req.body.userId}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * /notification
 * @summary Envia uma notificação para as subscrições de um usuário.
 * @memberof Conteudo.Notificacao
 * @function send
 * @param {object} req 
 * @param {object} req.body 
 * @param {object} req.body.userId id do usuário
 * @param {object} req.body.title título da notificação
 * @param {object} req.body.body corpo da notificação
 * @param {object} res 
 */
obj.send = async function (req, res, next = null) {
    try {
        await notificationService.send(req);
        req.app.locals.logger.info(`Sucesso ao enviar notificação push para as subscrições do usuário de ID ${req.body.userId}.`);
        if (next) {
            return next();
        }
        sendResponse(res, null, null);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao enviar notificação push o usuário de ID ${req.body.userId}. ${error}`);
        if (next) {
            return next();
        }
        sendResponse(res, error, null);
    }
}


/**
 * @summary Recupera a chave pública para assinar o serviço de notificação
 * @memberof Conteudo.Notificacao
 * @function getPublicKey
 * @param {object} req
 * @param {object} res
 */
obj.getPublicKey = async function (req, res) {
    return res.status(200).json({
        key: process.env.PUBLIC_VAPID_KEY
    });
}

/**
 * @summary Recupera uma lista de subscrições de notificação
 * @memberof Conteudo.Notificacao
 * @function getSubscriptions
 * @param {object} req
 * @param {object} res
 */
obj.getSubscriptions = async function (req, res) {
    req.app.locals.logger.info(`Recuperando as subscrições no escopo de permissão do usuário de ID ${req.decoded.data.id}`);
    try {
        let data = await SubscriptionModel.find();
        req.app.locals.logger.info(`Sucesso ao recuperar subscrições pelo usuário de ID ${req.decoded.data.id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar subscrições pelo usuário de ID ${req.decoded.data.id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * @summary Recupera uma subscrição de notificação
 * @memberof Conteudo.Notificacao
 * @function getSubscription
 * @param {object} req
 * @param {object} res
 */
obj.get = async function (req, res) {
    req.app.locals.logger.info(`Recuperando a subscrição de ID ${req.params.id} solicitada pelo usuário de ID ${req.decoded.data.id}`);
    try {
        let data = await SubscriptionModel.findOne({
            id: req.params.id
        })
        req.app.locals.logger.info(`Sucesso ao recuperar a subscrição de ID ${req.params.id} solicitada pelo usuário de ID ${req.decoded.data.id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar a subscrição de ID ${req.params.id} solicitada pelo usuário de ID ${req.decoded.data.id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Recupera todos os valores distintos de um campo
 * @param {*} req 
 * @param {*} res 
 */
obj.getFieldValues = async function (req, res) {
    let name = req.body.name || req.query.name;
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome do campo não informado."
        })
    }
    try {
        let data = await SubscriptionModel.distinct(req.body.name);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
module.exports = obj;