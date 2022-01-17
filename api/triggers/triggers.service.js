const ActionsService = require('../actions/actions.service');
const TriggerModel = require('./triggers.model');


class TriggerService {
    constructor() {
        this.actionsService = new ActionsService();
    }
    /**
     * Dispara um gatilho verificando que atenda as condições de execução e então acionando as ações relacionadas
     */
    async fireOne(req,query) {
        let trigger = await TriggerModel.findOne(query);
        if(trigger){
            await this.actionsService.execute(req,trigger.id);
        }
    }
    /**
     * Dispara gatilhos para múltiplas condições
     * @param {*} options 
     */
    async fire(req,options = {}) {
        if (options.lastDate) {
            let trigger1 = await TriggerModel.findOne(this.checkLastDate(req,options));
            if(trigger1){
                await this.actionsService.execute(req,trigger1.id);
            }

            let trigger2 = await TriggerModel.findOne(this.checkToday(req,options));
            if(trigger2){
                await this.actionsService.execute(req,trigger2.id);
            }
        }
    }
    /**
     * Verifica a data da última ocorrência do evento de usuário
     */
    checkLastDate(req,options) {
        let today = new Date();
        let Difference_In_Time = today.getTime() - options.lastDate.getTime();
        let Difference_In_Days = Difference_In_Time / (1000 * 86400);
        let Difference_In_Weeks = Difference_In_Time / (1000 * 86400 * 7);
        let Difference_In_Months = Difference_In_Time / (1000 * 86400 * 30);
        let Difference_In_Years = Difference_In_Time / (1000 * 86400 * 365);
        if (Difference_In_Years <= 0 && Difference_In_Months <= 0 && Difference_In_Weeks <= 0) {
            return {
                "event.action": options.action,
                "event.actionTime": "after",
                "event.actionTimeValue": Difference_In_Days,
                "event.actionTimeValueInterval": "day",
                "event.groupId": req.user.groups[0],
            };
        }
    
        if (Difference_In_Years <= 0 && Difference_In_Months <= 0) {
            return {
                "event.action": options.action,
                "event.actionTime": "after",
                "event.actionTimeValue": Difference_In_Weeks,
                "event.actionTimeValueInterval": "week",
                "event.groupId": req.user.groups[0],
            };
        }
        if (Difference_In_Years <= 0) {
            return {
                "event.action": options.action,
                "event.actionTime": "after",
                "event.actionTimeValue": Difference_In_Months,
                "event.actionTimeValueInterval": "month",
                "event.groupId": req.user.groups[0],
            };
        }
        if (Difference_In_Years >= 0) {
            return {
                "event.action": options.action,
                "event.actionTime": "after",
                "event.actionTimeValue": Difference_In_Years,
                "event.actionTimeValueInterval": "year",
                "event.groupId": req.user.groups[0],
            };
        }
    }
    /**
     * Verifica se é a primeira ocorrência do evento hoje
     * @param {*} options 
     */
    checkToday(req,options) {
        let today = new Date();
        if (today.getMonth() != options.lastDate.getMonth()
            || today.getDate() != options.lastDate.getDate()
            || today.getFullYear() || options.lastDate.getFullYear()) {
            return {
                "event.action": options.action,
                "event.actionTime": "today",
                "event.groupId": req.user.groups[0],
            };
        }
    }
}

module.exports = TriggerService;