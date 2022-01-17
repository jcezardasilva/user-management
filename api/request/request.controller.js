/**
 * Gerenciamento de histórico de requisições ao servidor
 * @namespace Requisicao
 */
let obj = {};

const Model = require('./request.model');

/**
 * Grava uma requisição HTTP recebida
 * @function post
 * @memberof Requisicao
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.save = function (req, res,next) {
    let id;
    if(req.user){
        id = req.user.id;
    }
    let data = new Model({
        id : req.app.locals.uniqid(),
        requestId: req.id,
        url: req.originalUrl,
        userId: id,
        origin: {
            host: req.header('Host'),
            origin: req.header('Origin'),
            userAgent: req.headers['user-agent']
        },
        date: new Date(new Date().toISOString())
    });
    data.save(() => next());
};

module.exports = obj;