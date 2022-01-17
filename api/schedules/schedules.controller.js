const TriggersModel = require('../triggers/triggers.model');
const ScheduleService = require('./schedules.service');

/**
 * Representa o agendamento para execução de tarefas a partir de gatilhos
 * @namespace Conteudo.Agendamentos
 * @memberof Conteudo
 */
let obj = {};

/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof Conteudo.Agendamentos
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
 * Middleware para adicionar um gatilho
 * @memberof Conteudo.Agendamentos
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object[]} res.triggerSchedules - Objetos contendo informações sobre datas de agendamento de cada gatilho
 */
obj.start = async function (req, res) {
    try {
        let scheduleService = new ScheduleService();
        scheduleService.triggers = await TriggersModel.find();
        await scheduleService.start();
        return res.status(200).json({
            message: "Execução de gatilhos iniciada",
            triggerSchedules: scheduleService.triggerSchedules
        })
    } catch (error) {
        return res.status(500).json({
            errmsg: "Falha ao agendar gatilhos"
        })
    }
}
/**
 * Middleware para adicionar um gatilho
 * @memberof Conteudo.Agendamentos
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.stop = async function (req, res) {
    try {
        let scheduleService = new ScheduleService();
        await scheduleService.stop();
        return res.status(200).json({
            message: "Execução de gatilhos interrompida"
        })
    } catch (error) {
        return res.status(500).json({
            errmsg: "Falha ao parar gatilhos"
        })
    }
}
/**
 * Middleware para adicionar um gatilho
 * @memberof Conteudo.Agendamentos
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Corpo da requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.restart = async function (req, res) {
    try {
        let scheduleService = new ScheduleService();
        scheduleService.triggers = await TriggersModel.find();
        await scheduleService.stop();
        await scheduleService.start();
        return res.status(200).json({
            message: "Execução de gatilhos reiniciada"
        })
    } catch (error) {
        return res.status(500).json({
            errmsg: "Falha ao reiniciar gatilhos"
        })
    }
}

/**
 * Recupera uma lista de Agendamentos
 * @memberof Conteudo.Agendamentos
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = function (req, res) {
    let query = req.app.locals.common.data.queryAssign(req);
    TriggersModel.find(query, (err, data) => {
        sendResponse(res, err, data);
    })
}
module.exports = obj;