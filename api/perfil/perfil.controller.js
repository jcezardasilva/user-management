/**
 * Representa os dados complementares dos usuários do sistema
 * @namespace CRM.Usuario.Perfil
 * @memberof CRM.Usuario
 */
let obj = {};

const Model = require('./perfil.model');
const UserModel = require('../user/user.model');

/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Usuario.Perfil
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
 * Adiciona um novo registro na aplicação
 * @function post
 * @memberof CRM.Usuario.Perfil
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Objeto com o esquema de dados de registro
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body = req.app.locals.common.data.bodyAssign(req,req.body);
    
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);
    try {
        await data.save();
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, data);
    }
}

/**
 * Recupera todos registros do perfil
 * @memberof CRM.Usuario.Perfil
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
 * Recupera um registro da aplicação
 * @function get
 * @memberof CRM.Usuario.Perfil
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = async function (req, res) {
    let id = req.params.id == 0 ? req.user.id : req.params.id;
    let query = req.app.locals.common.data.queryAssign(req, {
        id: id
    });
    try {
        let perfil = await Model.findOne(query);
        if(!perfil){
            return sendResponse(res, null, null);
        }
        if(req.params.id!=0){
            req.app.locals.points.add(req,res);
        }
        let data = Object.assign(perfil._doc);
        data.user = await UserModel.getUser(id);

        return sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}

/**
 * Atualiza um registro
 * @function put
 * @memberof CRM.Usuario.Perfil
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = async function (req, res) {
    let id = req.params.id == 0 ? req.user.id : req.params.id;
    let query = req.app.locals.common.data.queryAssign(req, {
        id: id
    });
    try {
        let data = await Model.updateOne(query, {
            $set: req.body
        },
        {
            upsert: 1
        });
        req.app.locals.points.add(req,res);
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Remomve um registro
 * @function delete
 * @memberof CRM.Usuario.Perfil
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req, {
        id: req.params.id
    });
    Model.deleteOne(query, (err, data) => {
        sendResponse(res, err, data);
    });
}

/**
 * Recupera a foto de um usuário
 * @param {*} req 
 * @param {*} res 
 */
obj.getUserPhoto = async function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req, {
        id: req.params.id
    });
    let data = await Model.findOne(query);
    if (data) {
        res.send(data.photo);
    } else {
        res.end();
    }
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
        let data = await Model.distinct(req.body.name, query);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
module.exports = obj;