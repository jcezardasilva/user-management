const webpush = require('web-push');
const NotificationModel = require('./notification.model');
const SubscriptionModel = require('./subscription.model');
class NotificationService {
    /**
     * @summary Configura a biblioteca de notificação
     * @protected
     */
    constructor() {
    }
    /**
     * Prepara e envia uma notificação
     * @param {*} req 
     */
    async send(req) {
        if(!req.app){
            return;
        }
        req.app.locals.logger.info(`Enviando notificação push para as subscrições do usuário de ID ${req.body.userId}.`);
        let subscriptions = await SubscriptionModel.find({ userId: req.body.userId });
        const content = JSON.stringify({
            title: req.body.title,
            body: req.body.body
        });

        let results = [];
        for (const subscription of subscriptions) {
            let result = await this.sendToSubscription(subscription, content, req);
            results.push(result);
        }

        let notificationData = NotificationModel({
            id: req.app.locals.uniqid(),
            from: req.user.id,
            to: req.body.userId,
            title: req.body.title,
            body: req.body.body,
            info: {
                results: results
            },
            date: new Date()
        })
        await notificationData.save();
    }
    /**
     * Envia a notificação para uma subscrição do usuário
     * @param {*} subscription 
     * @param {*} content 
     * @param {*} req 
     */
    async sendToSubscription(subscription, content, req) {
        let result = await this.delivery(subscription.subscription, content);
        if (result && result.errmsg) {
            req.app.locals.logger.warn(`Removendo subscrição de ID ${subscription.id} com falha. Usuário de ID ${req.body.userId}.`);
            await SubscriptionModel.deleteOne({ id: subscription.id });
            return {
                id: subscription.id,
                success: false
            };
        }
        else {
            req.app.locals.logger.info(`Enviando notificação push para a subscrição de ID ${subscription.id}. Usuário de ID ${req.body.userId}.`);
            return {
                id: subscription.id,
                success: true
            };
        }
    }
    /**
    * Dispara a notificação para uma subscrição
    * @param {*} subscriptionId 
    * @param {*} content 
    */
    async delivery(subscriptionId, content) {
        try {
            webpush.setGCMAPIKey(process.env.GCM_API_KEY);
            webpush.setVapidDetails(
                `mailto:${process.env.EMAIL_USER}`,
                process.env.PUBLIC_VAPID_KEY,
                process.env.PRIVATE_VAPID_KEY
            );
            await webpush.sendNotification(subscriptionId, content);
            return null;
        } catch (error) {
            return { errmsg: "Falha ao enviar notificação para a subscrição.", id: subscriptionId };
        }
    }
}

module.exports = NotificationService;