/**
 * Gestão de profissões
 * @namespace CRM.Profissao
 * @memberof CRM
 */
let obj = {};
/**
 * modelo de profissões
 * @alias model
 * @memberof CRM.Profissao
 * @public
 */
const Model = require('./profession.model');

/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Profissao
 * @protected
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {object} data - Objeto de dados a ser enviado na resposta HTTP se não houver erros no tratamento
 */
function sendResponse(res, err, data) {
    if (err) {
        return res.status(400).json(err);
    } else {
        return res.status(200).json(data);
    }
}
/**
 * Adiciona uma profissão na aplicação
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body = req.app.locals.common.data.bodyAssign(req, req.body);

    req.body.userId = req.user.id;
    req.body.id = req.app.locals.uniqid();

    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    try {
        req.app.locals.logger.info(`adicionando nova profissão.`);
        await data.save();
        req.app.locals.points.add(req, res);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.info(`Falha ao carregar nova profissão. ${error}`);
        sendResponse(res, error, null);
    }
}

/**
 * Recupera uma profissão
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = async function (req, res) {
    try {
        let data = await Model.findOne({
            id: req.params.id
        })
        res.status(200).send(data.content);
    } catch (error) {
        res.status(400).send(error);
    }
}

/**
 * Recupera todas as profissões do sistema
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = function (req, res) {
    Model.find({}, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Atualiza uma profissão
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = async function (req, res) {
    try {
        await Model.updateOne({
            id: req.params.id
        }, {
            $set: req.body
        });
        let data = await Model.findOne({
            id: req.params.id
        })
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Remomve uma profissão
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = function (req, res) {
    Model.deleteOne({
        id: req.params.id
    }, (err, data) => {
        sendResponse(res, err, data);
    });
}

/**
 * Busca profissões para determinados critérios
 * @function search
 * @memberof CRM.Profissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @return {object[]} lista de objetos de configuração
 */
obj.search = async function (req, res) {
    try {
        let data = await Model.find(req.body);
        sendResponse(res, null, data);
    } catch (error) {
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
        let data = await Model.distinct(req.body.name);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
module.exports = obj;