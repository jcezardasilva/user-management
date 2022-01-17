const hapi = require('@hapi/address');
const nodemailer = require('nodemailer');
const config = require('../../config');
/**
 * Recursos para meensagens de e-mail
 * @namespace Comum.Mailer
 * @memberof Comum
 */
let obj = {};

/**
 * Cria uma instância de cliente de serviço de e-mail
 * @function createTransport
 * @memberof Comum.Mailer
 * @param {object} options Opções para comunicação com o serviço de e-mail
 * @param {string} options.service Identificação do serviço de e-mail
 * @param {object} options.auth Dados de autenticação com o serviço de e-mail
 * @param {string} options.auth.user Usuário do serviço de e-mail
 * @param {string} options.auth.password Senha do serviço de e-mail
 */
obj.createTransport = function (options = null) {
    options = options || config.mailer;
    obj.account = nodemailer.createTransport(options);
}
/**
 * Analisa um endereço de e-mail
 * @function analyze
 * @memberof Comum.Mailer
 * @param {string} email endereço de e-mail
 * @return verdadeiro ou descrição da falha encontrada no e-mail
 */
obj.analyze = function (email) {
    let result = hapi.email.analyze(email);
    return result || {
        isValid: this.validate(email)
    };
}
/**
 * Verifica se um endereço de e-mail é válido
 * @function validate
 * @memberof Comum.Mailer
 * @param {string} email endereço de e-mail
 * @return verdadeiro ou falso
 */
obj.validate = function (email) {
    return hapi.email.isValid(email);
}
/**
 * Envia uma mensagem de e-mail
 * @function sendMail
 * @memberof Comum.Mailer
 * @param {object} options Opções para envio da mensagem
 * @param {object[]} options.to Destinatários da mensagem
 * @param {string} options.subject Assunto da mensagem
 * @param {string[]} options.cc    E-mails para cópia
 * @param {string[]} options.bcc    E-mails para cópia oculta
 * @param {string} options.html    Conteúdo da mensagem formatado em HTML
 * @param {string[]} options.attachments Anexos do e-mail
 * 
 */
obj.sendMail = async function (options) {
    options.from = obj.account.transporter.auth.user;
    return new Promise((resolve, reject) => {
        if (config.app.NODE_ENV === "test") {
            resolve({
                message: 'teste de usuário'
            });
        } else {
            obj.account.sendMail(options, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            })
        }
    })
}

module.exports = obj;