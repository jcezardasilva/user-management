const uniqid = require("uniqid");

/**
 * Controlador de condições de permissão
 * @namespace CRM.Permissao.Condicoes
 * @memberof CRM.Permissao
 */
let obj = {};

/**
 * modelo de condições de permissão
 * @memberof CRM.Permissao.Condicoes
 * @public
 */
const Model = require('./permissionCondition.model');
/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Permissao.Condicoes
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
 * @memberof CRM.Permissao.Condicoes
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: name_1 dup key') > -1) {
        return errors.push("já existe uma condição de permissão com este nome");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Permissao.Condicoes
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
 * Adiciona uma condição de permissão na aplicação
 * @function post
 * @memberof CRM.Permissao.Condicoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body.id = uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    data.save((err) => sendResponse(res, err, data));
};

/**
 * Recupera uma lista de condições de permissão da aplicação
 * @function getAll
 * @memberof CRM.Permissao.Condicoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = async function (req, res) {
    try {
        let data = await Model.find();
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
 * @memberof CRM.Permissao.Condicoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = async function (req, res) {
    Model.findOne({
        id: req.params.id
    }, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Atualiza uma condição de permissão
 * @function put
 * @memberof CRM.Permissao.Condicoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = async function (req, res) {
    try {
        let conditions = await Model.findOne({
            id: req.params.id
        })
        for (const field in req.body) {
            conditions[field] = req.body[field];
        }
        let result = await conditions.save();
        sendResponse(res, null, result);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Remomve uma permissão
 * @function delete
 * @memberof CRM.Permissao.Condicoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = async function (req, res) {
    Model.deleteOne({
        id: req.params.id
    }, (err, data) => {
        sendResponse(res, err, data);
    });
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