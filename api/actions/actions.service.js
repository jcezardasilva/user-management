const ActionModel = require('./actions.model');
const NotificationService = require('../notification/notification.service');
const UserModel = require('../user/user.model');
class ActionService {
    constructor() {
        this.notificationService = new NotificationService();
    }
    /**
     * Executa todas as ações associadas a um gatilho
     * @param {*} req 
     * @param {*} triggerId 
     */
    async execute(req, triggerId) {
        this.req = req;
        if (req.user.id) {
            this.userId = req.user.id;
        }
        this.triggerId = triggerId;

        let actionList = await ActionModel.find({
            triggerId: triggerId
        })
        const actionTypes = req.user.id ? {
            "push message": async (action) => await this.sendPush(action),
        } : {
                "push message": async (action) => await this.sendPushes(action),
            }
        for (const action of actionList) {
            await actionTypes[action.type](action);
        }
    }
    /**
     * Envia uma notificação push para um grupo de usuários de acordo com o gatilho acionado
     * @param {*} action 
     */
    async sendPushes(action) {
        let userList = await UserModel.find({
            groups: {
                $elemMatch: {
                    $eq: this.triggerId
                }
            }
        })
        for (const user of userList) {
            this.userId = user.id;
            await this.sendPush(action);
        }
    }
    /**
     * Envia uma notificação push para um usuário de acordo com o gatilho acionado
     * @param {*} action 
     */
    async sendPush(action) {
        this.req.body = Object.assign({}, {
            userId: this.userId,
            title: action.body.title,
            body: action.body.content
        })
        this.req.user = {
            id: action.sender
        }
        await this.notificationService.send(this.req);
    }
}

module.exports = ActionService;