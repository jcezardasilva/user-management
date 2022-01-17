const controller = require('./server.controller');
let router = require('express').Router();

router.route('/')
    .get(controller.get)

module.exports = router;