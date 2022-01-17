/**
 * Controlador para recursos do servidor
 * @namespace Comum.Servidor
 * @memberof Comum
 */
var obj = {};
/**
 * Recupera o estado atual do servidor
 * @function get
 * @memberof Comum.Servidor
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @return Objeto informando que o servidoro está ligado e data/hora da última inicialização
 */
obj.get = function (req, res) {
    res.status(200).json({
        message: 'servidor ativo!',
        startTime: req.app.locals.startTime.toISOString(),
        timezone: "UTC"
    });
}

module.exports = obj;