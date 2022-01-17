const uniqid = require("uniqid");
const Model = require('../api/log/log.model');

/**
 * Grava um registro de log no banco de dados
 * @param {string} level nível da mensagem: info < warn < error
 * @param {string} text texto da mensagem
 */
async function toDB(level, text) {
    try {
        let input = {
            id: uniqid(),
            text: text,
            level: level,
            date: new Date(new Date().toISOString())
        }
        let data = new Model(input);
        return await data.save();
    } catch (err) {
        console.log("Falha ao registrar log no banco de dados.", err);
        return Promise.resolve();
    }
}

/**
 * Registra um log de informação
 * @param {string} text Texto do log
 */
function log(text) {
    console.log(text);
    toDB('info', text);
}

/**
 * Registra um log de informação
 * @param {string} text Texto do log
 */
function info(text) {
    console.info(text);
    toDB('info', text);
}

/**
 * Registra um log de alerta
 * @param {string} text Texto do log
 */
function warn(text) {
    console.warn(text);
    toDB('warn', text);
}

/**
 * Registra um log de erro
 * @param {string} text Texto do log
 */
function error(text) {
    console.error(text);
    toDB('error', text);
}
module.exports = {
    log,
    info,
    warn,
    error
};