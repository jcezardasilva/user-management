const uniqid = require('uniqid');
/**
 * Controlador para configurações da aplicação
 * @namespace Comum.Configuracao
 * @memberof Comum
 */
let obj = {};

const Model = require('./configurations.model');

/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof Comum.Configuracao
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @return {string[]} Lista de erros identificados para envioi na resposta da requisição
 */
function treatErrors(err) {
    let errors = [];
    treatErrorsNameExists(err, errors);
    if(errors.length==0){
        return err;
    }
    return errors;
}
/**
 * Verifica se houve erro de duplicidade de nome
 * @memberof Comum.Configuracao
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg.indexOf('index: name_1 dup key') > -1) {
        return errors.push("já existe uma configuração com este nome");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof Comum.Configuracao
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
 * Adiciona uma configuração na aplicação
 * @function post
 * @memberof Comum.Configuracao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = function (req, res) {
    req.body = req.app.locals.common.data.bodyAssign(req,req.body);
    
    req.body.id = uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    data.save((err) => sendResponse(res, err, data));
};

/**
 * Recupera uma configuração da aplicação
 * @function get
 * @memberof Comum.Configuracao
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
 * Atualiza uma configuração
 * @function put
 * @memberof Comum.Configuracao
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
 * Remomve uma configuração
 * @function delete
 * @memberof Comum.Configuracao
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
 * Busca configurações para determinados critérios
 * @function search
 * @memberof Comum.Configuracao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @return {object[]} lista de objetos de configuração
 */
obj.search = async function(req,res){
    let query = req.app.locals.common.data.queryAssign(req,req.body);
    try {
        let data = await Model.find(query);
        sendResponse(res,null,data);
    } catch (error) {
        sendResponse(res,error,null);
    }
}
/**
 * Busca configurações para determinados critérios
 * @function find
 * @memberof Comum.Configuracao
 * @param {object} query - Objeto com critérios de busca
 * @return {object[]} lista de objetos de configuração
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
        let data = await Model.distinct(req.body.name,query);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}

module.exports = obj;