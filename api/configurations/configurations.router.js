const userService = require('../../services').get("userService");
const controller = require('./configurations.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(allMiddlewares,controller.post)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)    
router.route("/search")
    .post(controller.search)    

router.route("/:id")    
    .get(controller.get)
    .put(allMiddlewares,controller.put)
    .delete(allMiddlewares,controller.delete)

module.exports = router;