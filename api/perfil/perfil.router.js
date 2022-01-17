const userService = require('../../services').get("userService");
const controller =  require('./perfil.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .get(allMiddlewares,controller.getAll) 
router.route("/perfilInsert")
    .post(allMiddlewares,controller.post)
    .get(allMiddlewares,controller.getAll)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)

router.route("/:id")
    .get(allMiddlewares,controller.get)
    .put(allMiddlewares,controller.put)
    .delete(allMiddlewares,controller.delete)
router.route("/:id/photo")
    .get(allMiddlewares,controller.getUserPhoto)
module.exports = router;
