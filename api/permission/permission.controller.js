/**
 * Controlador de permissão
 * @namespace CRM.Permissao
 * @memberof CRM
 */
let obj = {};

const Model = require('./permission.model');

/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Permissao
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @return {string[]} Lista de erros identificados para envioi na resposta da requisição
 */
function treatErrors(err) {
    let errors = [];
    treatErrorsNameExists(err, errors);
    if (errors.length == 0) {
        return err;
    }
    return errors;
}
/**
 * Verifica se houve erro de duplicidade de nome
 * @memberof CRM.Permissao
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: name_1 dup key') > -1) {
        return errors.push("já existe uma permissão com este nome");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Permissao
 * @protected
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {object} data - Objeto de dados a ser enviado na resposta HTTP se não houver erros no tratamento
 */
function sendResponse(res, err, data) {
    if (err) {
        let errors = treatErrors(err);
        return res.status(400).json(errors);
    } else {
        return res.status(200).json(data);
    }
}
/**
 * Adiciona uma permissão na aplicação
 * @function post
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    try {
        let data = await Model.createPermission();
        return sendResponse(res,null,data);
    } catch (error) {
        return sendResponse(res,error,null);
    }
};

/**
 * Recupera uma lista de permissões da aplicação
 * @function getAll
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req);
        let data = await Model.find(query);
        req.app.locals.logger.info(`Sucesso ao recuperar permissões`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar permissões. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Recupera uma permissão da aplicação
 * @function get
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,{
        id: req.params.id
    });
    Model.findOne(query, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Atualiza uma permissão
 * @function put
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,{
        id: req.params.id
    });
    Model.updateOne(query, {
        $set: req.body
    }, (err, data) => {
        sendResponse(res, err, data);
    });
}
/**
 * Remomve uma permissão
 * @function delete
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,{
        id: req.params.id
    });
    Model.deleteOne(query, (err, data) => {
        sendResponse(res, err, data);
    });
}

/**
 * Busca permissões para determinados critérios
 * @function search
 * @memberof CRM.Permissao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @return {object[]} lista de objetos de configuração
 */
obj.search = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req,req.body);
        let data = await Model.find(query);
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Busca permissões para determinados critérios
 * @function find
 * @memberof CRM.Permissao
 * @param {object} query - Objeto com critérios de busca
 * @return {object[]} lista de objetos de permissão
 */
obj.find = async function (query) {
    return await Model.find(query);
}
/**
 * Retorna o maior nível de permissões em uma lista
 * @function maxLevel
 * @memberof CRM.Permissao
 * @param {String[]} levels - Lista de níveis de permissão
 * @return {object[]} lista de objetos de permissão
 */
obj.maxLevel = function (levels) {
    return Model.maxLevel(levels);
}
/**
 * Recupera todos os valores distintos de um campo
 * @param {*} req 
 * @param {*} res 
 */
obj.getFieldValues = async function (req, res) {
    let name = req.body.name || req.query.name;
    let query = req.app.locals.common.data.queryAssign(req);
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome do campo não informado."
        })
    }
    try {
        let data = await Model.distinct(req.body.name,query);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
module.exports = obj;