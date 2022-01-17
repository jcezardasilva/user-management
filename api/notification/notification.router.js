const userService = require('../../services').get("userService");
const controller =  require('./notification.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(allMiddlewares,controller.send)

router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)
router.route("/subscription")
    .post(allMiddlewares,controller.subscribe)
    .get(allMiddlewares,controller.getSubscriptions)
    .delete(allMiddlewares,controller.unsubscribe)
router.route("/subscription/:id")
    .get(allMiddlewares,controller.get)
router.route("/subscribe")
    .post(userService.validateSession,controller.subscribe)
router.route("/unsubscribe")
    .post(allMiddlewares,controller.unsubscribe)
router.route("/vapidkey")
    .get(controller.getPublicKey)
module.exports = router;