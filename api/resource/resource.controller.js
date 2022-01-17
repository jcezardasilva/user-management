/**
 * Controlador de recurso
 * @namespace CRM.Recurso
 * @memberof CRM
 */
let obj = {};

const Model = require('./resource.model');
const PermissionModel = require('../permission/permission.model');
/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Recurso
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
 * @memberof CRM.Recurso
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: name_1 dup key') > -1) {
        return errors.push("já existe um recurso com este nome");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Recurso
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
 * Adiciona um recurso na aplicação
 * @function post
 * @memberof CRM.Recurso
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);

    try {
        await data.save();
        await createReadPermission(req,data);
        await createWritePermission(req,data);

        return sendResponse(res, null, data)
    } catch (error) {
        return sendResponse(res, error, null)
    }
    
}
async function createReadPermission(req,data){
    let oldbody = Object.assign(req.body);
    let resource = req.body.name.slice(-1) == "s" ? req.body.name : req.body.name + "s";
    let body = {
        "name": `visualizar_${req.body.name}`,
        "description": `Visualizar ${resource}`,
        "roles": ["read"],
        "resourceId": data.id
    }
    req.body = Object.assign(body);
    await PermissionModel.createPermission(req);
    req.body = Object.assign(oldbody);
}
async function createWritePermission(req,data){
    let resource = req.body.name.slice(-1) == "s" ? req.body.name : req.body.name + "s";
    let oldbody = Object.assign(req.body);
    let body = {
        "name": `criar_alterar_${req.body.name}`,
        "description": `Criar e alterar ${resource}`,
        "roles": ["write"],
        "resourceId": data.id
    }
    req.body = Object.assign(body);
    await PermissionModel.createPermission(req);
    req.body = Object.assign(oldbody);
}

/**
 * Recupera uma lista de recursos da aplicação
 * @function getAll
 * @memberof CRM.Recurso
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req);
    try {
        let data = await Model.find(query);
        req.app.locals.logger.info(`Sucesso ao recuperar lista de recursos.`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar lista de recursos. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Recupera um recurso da aplicação
 * @function get
 * @memberof CRM.Recurso
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
 * Atualiza um recurso
 * @function put
 * @memberof CRM.Recurso
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
 * Remomve um recurso
 * @function delete
 * @memberof CRM.Recurso
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
 * Busca recursos para determinados critérios
 * @function search
 * @memberof CRM.Recurso
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
 * Busca recursos para determinados critérios
 * @function find
 * @memberof CRM.Recurso
 * @param {object} query - Objeto com critérios de busca
 * @return {object[]} lista de objetos de recurso
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