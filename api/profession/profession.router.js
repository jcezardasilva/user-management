const controller = require('./profession.controller');
const userService = require('../../services').get("userService");
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(allMiddlewares, controller.post)
    .get(controller.getAll)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)
router.route("/search")
    .post(allMiddlewares,controller.search)
router.route("/:id")    
    .get(controller.get)
    .put(allMiddlewares,controller.put)
    .delete(allMiddlewares,controller.delete)

module.exports = router;