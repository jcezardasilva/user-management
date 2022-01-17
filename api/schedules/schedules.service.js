const ActionsService = require('../actions/actions.service');
const schedule = require('node-schedule');
class ScheduleService {
    constructor(triggers) {
        this.schedules = [];
        this.triggers = triggers;
        this.actionsService = new ActionsService();
        this.triggerSchedules = [];
    }
    /**
     * Inicia os agendamentos para disparo de ações
     */
    async start() {
        let dates = [];
        for (const trigger of this.triggers) {
            let triggerDates = trigger.scheduling.recurrence.map((date) => {
                return {
                    id: trigger.id,
                    date: date
                }
            })
            dates = dates.concat(triggerDates);
        }
        
        dates = dates.filter((date)=>date>Date());

        for (const date of dates) {
            let j = schedule.scheduleJob(date.date, this.actionsService.execute(date.id));
            this.triggerSchedules.push({
                date: date.date,
                triggerId: date.id
            })
            this.schedules.push(j);
        }
    }
    /**
     * Pausa todos os agendamentos de ações
     */
    async stop() {
        for(const s of this.schedules){
            try {
                s.cancel();   
            } catch (error) {
                console.log(error);
            }
        }
    }
    /**
     * Reinicia todos os agendamentos de ações
     */
    async restart() {
        this.stop();
        this.start();
    }
    /**
     * Recupera a lista de agendamentos
     */
    getAll(){
        return this.schedules;
    }
}

module.exports = ScheduleService;