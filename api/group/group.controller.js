const OrganizationModel = require('../organization/organization.model');
/**
 * Representa os grupos de usuário no sistema, seu esquema de dados e suas ações
 * @namespace CRM.Grupo
 * @memberof CRM
 */
let obj = {};

/**
 * modelo de grupo
 * @alias model
 * @memberof CRM.Grupo
 */
const Model = require('./group.model');

/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Grupo
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
 * @memberof CRM.Grupo
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro de nome caso exista
 */
function treatErrorsNameExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: name_1_organization_1 dup key') > -1) {
        return errors.push("já existe um grupo com este nome nessa organização");
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Grupo
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
 * Adiciona um novo grupo na aplicação
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {string} req.body.name - Nome do grupo
 * @param {string} req.body.organization - Nome ou ID da organização. Se a organização não existir o valor será considerado para nome da nova organização
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body.id = req.app.locals.uniqid();
    if(!req.body.organizationId){
        let orgId = req.app.locals.uniqid();
        let org = new OrganizationModel({
            id: orgId,
            name: req.body.organization,
            date: new Date(new Date().toISOString())
        })
        await org.save();
        req.body.organizationId = orgId;
    }

    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    data.save((err) => sendResponse(res, err, data));
}

/**
 * Recupera um grupo da aplicação
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,{
        id: req.params.id
    });
    Model.findOne(query, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Recupera todas as organizações do sistema
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req);
    Model.find(query, (err, data) => {
        sendResponse(res, err, data);
    })
}
/**
 * Atualiza um grupo
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = async function (req, res) {
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
 * Adiciona uma permissão a um grupo
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.postPermission = async function (req, res) {
    let id = req.params.id;
    let query = req.app.locals.common.data.queryAssign(req,{
        id: id
    });
    try {
        let data = await Model.updateOne(query, {
            $addToSet: {
                permissions: req.body
            }
        });
        req.app.locals.logger.info(`Sucesso ao adicionar permissões do grupo ${id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao adicionar permissões de grupo ${id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Atualiza uma permissão de um grupo
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.params - Parametros da URL da requisição
 * @param {object} req.params.id - ID do grupo que terá as permissões ajustadas
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {Boolean} req.body.isActive - Indica se a permissão está habilitada ou não para o usuário
 * @param {string} req.body.permissionConditionId - ID do conjunto de filtros que compõem a condição de uso da permissão pelo usuário
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.putPermission = async function (req, res) {
    let id = req.params.id;
    let query = req.app.locals.common.data.queryAssign(req,{
        id: id,
        permissions: {
            "$elemMatch": {
                "permissionId": req.body.permissionId
            }
        }
    });

    let set = {};
    set['permissions.$.isActive'] = req.body.isActive;
    
    if(req.body.permissionConditionId){
        set["permissions.$.permissionConditionId"] = req.body.permissionConditionId;
    }
    try {
        let data = await Model.updateOne(query, {
            $set: set
        });
        req.app.locals.logger.info(`Sucesso ao atualizar permissões do grupo ${id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao atualizar permissões de grupo ${id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Remomve um grupo
 * @memberof CRM.Grupo
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req,{
        id: req.params.id
    });
    Model.deleteOne(query, (err, data) => {
        sendResponse(res, err, data);
    });
}
/**
 * Busca grupos para determinados critérios
 * @function search
 * @memberof CRM.Grupo
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
 * Faz a busca de um grupo no banco de dados
 * @memberof CRM.Grupo
 * @param {object} query - Objeto com parâmetros de busca
 */
obj.find = async function (query) {
    return await Model.find(query);
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