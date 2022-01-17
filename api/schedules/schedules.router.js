const controller = require('./schedules.controller');
const userService = require('../../services').get("userService");
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .get(allMiddlewares,controller.getAll)
router.route("/stop")
    .post(allMiddlewares,controller.stop)
router.route("/start")
    .post(allMiddlewares,controller.start)
router.route("/restart")
    .post(allMiddlewares,controller.restart)
module.exports = router;