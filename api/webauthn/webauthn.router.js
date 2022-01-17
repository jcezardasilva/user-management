const userService = require('../../services').get("userService");
const controller = require('./webauthn.controller');
const request = require('../request/request.controller');
let router = require('express').Router();

router.route("/disable")
    .post(userService.validateSession,request.save,controller.delete)
    .delete(userService.validateSession,request.save,controller.delete)
router.route("/login")
    .post(request.save,controller.login)
router.route("/logout")
    .get(userService.validateSession,request.save,controller.logout)
router.route("/isenabled")
    .get(userService.validateSession,request.save,controller.isEnabled)
router.route("/register")
    .post(userService.validateSession,request.save, controller.register)
router.route("/response")
    .post(request.save,controller.response)
module.exports = router;