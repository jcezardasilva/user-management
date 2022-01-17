const controller =  require('./user.controller');
const userService = require('../../services').get("userService");
const request = require('../request/request.controller');
let router = require('express').Router();

const allMiddlewares = [userService.validateSession,userService.validatePermission,request.save];

router.route("/")
    .post(request.save,controller.post)
    .get(allMiddlewares, controller.getAll)
router.route("/searchfield")
    .get(allMiddlewares,controller.getFieldValues)
    .post(allMiddlewares,controller.getFieldValues)
router.route("/searchproperty")
    .get(allMiddlewares,controller.getPropertyValues)
    .post(allMiddlewares,controller.getPropertyValues)
router.route('/confirmation')
    .post(userService.validateSession,request.save,controller.postConfirmation);
router.route('/login')
    .post(controller.validateEmail,controller.validatePassword,request.save,controller.login)
router.route('/session')
    .post(request.save,controller.getSession)
    .get(request.save,controller.getSession)
router.route('/permission')
    .post(userService.validateSession,request.save,controller.getPermission)
    .get(userService.validateSession,request.save,controller.getPermission)
router.route('/permission/:resourceName')
    .get(userService.validateSession, controller.getPermissionByResourceName)
router.route('/forgotEmail')
    .post(controller.validateEmail,request.save,controller.sendEmailForgot)
router.route('/changepassword')
    .post(userService.validateSession,request.save,controller.changePassword)
router.route('/count')
    .post(allMiddlewares,controller.countUsers)
    .get(allMiddlewares,controller.countUsers)
router.route("/:id")
    .get(allMiddlewares,controller.get)
    .put(allMiddlewares,controller.put)
    .delete(allMiddlewares,controller.delete)
module.exports = router;
