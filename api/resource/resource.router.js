const userService = require('../../services').get("userService");
const controller = require('./resource.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(allMiddlewares,controller.post)
    .get(allMiddlewares,controller.getAll)
    .delete(controller.delete)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)
router.route("/search")
    .post(controller.search)
router.route("/:id")    
    .get(allMiddlewares,controller.get)
    .put(allMiddlewares,controller.put)

module.exports = router;