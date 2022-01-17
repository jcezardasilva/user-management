const userService = require('../../services').get("userService");
const controller =  require('./dataFields.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(controller.post)
    .get(controller.getAll)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)
router.route("/:id")
    .get(controller.get)
    .put(controller.put)
    .delete(controller.delete)
module.exports = router;
