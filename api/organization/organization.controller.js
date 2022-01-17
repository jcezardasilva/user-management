/**
 * Representa recursos básicos para cadastro de usuários e suas permissões
 * @namespace CRM
 */

/**
 * Representa as empresas no sistema, seu esquema de dados e suas ações
 * @namespace CRM.Organizacao
 * @memberof CRM
 */
let obj = {};
/**
 * modelo de organização
 * @alias model
 * @memberof CRM.Organizacao
 * @public
 */
const Model = require('./organization.model');
/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Organizacao
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
 * @memberof CRM.Organizacao
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg.indexOf('index: name_1 dup key') > -1) {
        return errors.push("já existe uma organização com este nome");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Organizacao
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
 * Adiciona uma organização na aplicação
 * @memberof CRM.Organizacao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = function (req, res) {
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    data.save((err) => sendResponse(res, err, data));
};

/**
 * Recupera uma organização da aplicação
 * @memberof CRM.Organizacao
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
 * Recupera todas as organizações do sistema
 * @memberof CRM.Organizacao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req);

    Model.find(query, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Atualiza uma organização
 * @memberof CRM.Organizacao
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
 * Remomve uma organização
 * @memberof CRM.Organizacao
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
 * Busca organizações para determinados critérios
 * @function search
 * @memberof CRM.Organizacao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @return {object[]} lista de objetos de configuração
 */
obj.search = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,req.body);

    try {
        let data = await obj.find(query);
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Busca organizações para determinados critérios
 * @function find
 * @memberof CRM.Organizacao
 * @param {object} query - Objeto com critérios de busca
 * @return {object[]} lista de objetos de permissão
 */
obj.find = async function (query) {
    return new Promise((resolve, reject) => {
        Model.find(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}
/**
 * Recupera todos os valores distintos de um campo
 * @param {*} req 
 * @param {*} res 
 */
obj.getFieldValues = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req);

    let name = req.body.name || req.query.name;
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome do campo não informado."
        })
    }
    try {
        let data = await Model.distinct(req.body.name, query);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json(error);
    }
}
module.exports = obj;