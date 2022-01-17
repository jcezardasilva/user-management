const Model = require('./dataFields.model');

/**
 * @summary Campos de dados. Utilizados na especialização de entidades no sistema.
 * @namespace Comum.Dados
 * @memberof CRM
 */
let obj = {};

/**
 * @summary Emite uma resposta a uma requisição HTTP
 * @memberof Comum.Dados
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
 * @summary Adiciona um novo campo de dados ao sistema
 * @memberof Comum.Dados
 * @param {*} req 
 * @param {*} res 
 */
obj.post = async function (req, res) {
    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());
    try {
        let data = new Model(req.body);
        let result = await data.save();   
        
        result = await getChildren(result);

        sendResponse(res, null, result);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * @summary Recupera uma lista de campos de dados
 * @memberof Comum.Dados
 * @param {*} req 
 * @param {*} res 
 */
obj.getAll = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req);
        let data = await Model.find(query);

        let output = [];
        for (const d of data) {
            let out = await getChildren(d);
            output.push(out);
        }

        sendResponse(res, null, output);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * @summary Recupera um campo de dados
 * @memberof Comum.Dados
 * @param {*} req 
 * @param {*} res 
 */
obj.get = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req,{
            id: req.params.id
        });
        let data = await Model.findOne(query);
        let output = await getChildren(data);
        sendResponse(res, null, output);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * Recupera os objetos filhos recursivamente
 * @memberof Comum.Dados
 * @param {object} input instância de um campo de dados
 */
async function getChildren(input){
    let output = Object.assign(input);

    if(input.children && input.children.length>0){
        let outputs = [];
        for (const d of input.children) {
            let c = await Model.findOne({id: d}) || {};

            let subchildren = await getChildren(c);
            
            outputs.push(Object.assign({
                children: subchildren
            }));
        }

        output = Object.assign(output._doc,{
            children: outputs
        })
        return Promise.resolve(output);
    }
    else{
        return Promise.resolve(output);
    }
}
/**
 * @summary Atualiza as propriedades de um campo de dados
 * @memberof Comum.Dados
 * @param {*} req 
 * @param {*} res 
 */
obj.put = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req,{
            id: req.params.id
        });
        let set = {};
        if(req.body.dataType){
            set.dataType = req.body.dataType;
        }
        if(req.body.value){
            set.value = req.body.value;
        }
        if(req.body.children){
            set.children = req.body.children;
        }
        if(req.body.name){
            set.name = req.body.name;
        }
        if(req.body.label){
            set.label = req.body.label;
        }
        
        let data = await Model.updateOne(query, {
            $set: set
        });
        
        data = await getChildren(data);
        sendResponse(res, null, data);
    } catch (error) {
        sendResponse(res, error, null);
    }
}
/**
 * @summary Remove um campo de dados ao sistema
 * @memberof Comum.Dados
 * @param {*} req 
 * @param {*} res 
 */
obj.delete = async function (req, res) {
    try {
        let query = req.app.locals.common.data.queryAssign(req,{
            id: req.params.id
        });
        let data = await Model.deleteOne(query);
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