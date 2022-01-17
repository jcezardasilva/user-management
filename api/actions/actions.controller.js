/**
 * Cadastro de ações no sistema que serão disparadas por gatilhos
 * @namespace Relacionamento.Acoes
 * @memberof Relacionamento
 */
let obj = {};
/**
 * modelo de dados para ações de relacionamento
 * @alias model
 * @memberof Relacionamento.Acoes
 * @public
 */
const Model = require('./actions.model');

/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof Relacionamento.Acoes
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
 * adicionar uma ação
 * @memberof Relacionamento.Acoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.body = req.app.locals.common.data.bodyAssign(req,req.body);
    
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    let data = new Model(req.body);

    try {
        await data.save();
        req.app.locals.logger.info(`Sucesso adicionar novo gatilho pelo usuário: ${req.decoded.data.id}`);
        return sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao gerar adicionar novo gatilho pelo usuário ${req.decoded.data.id}. ${error.message}`);
        return sendResponse(res, error, null);
    }
};

/**
 * Recupera uma lista de Acoes
 * @memberof Relacionamento.Acoes
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
 * Recupera uma ação
 * @memberof Relacionamento.Acoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.params Parâmetros da requisição HTTP
 * @param {object} req.params.id ID do modelo que será recuperado
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
 * Atualiza uma ação
 * @memberof Relacionamento.Acoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.params Parâmetros da requisição HTTP
 * @param {object} req.params.id ID do modelo que será atualizado
 * @param {object} req.body Corpo da requisição HTTP
 * @param {object} [req.body.content] Conteúdo do modelo de mensagem
 * @param {Boolean} [req.body.isDefault] Indica se é um modelo padrão
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
    })
}
/**
 * Remove uma ação
 * @memberof Relacionamento.Acoes
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.params Parâmetros da requisição HTTP
 * @param {object} req.params.id ID do modelo que será removido
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