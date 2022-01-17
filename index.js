const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const contentFilter = require('content-filter');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');

const app = express();
const http = require('http').Server(app);

const config = require('./config');
const logger = require('./services/logger');
const api = require('./api');
const services = require("./services");

const HttpClient = require("./api/httpClient/httpClient");
const TriggerService = require('./api/triggers/triggers.service');
const UserService = require('./api/user/user.service');

function requestId(req,res,next){
    req["id"] = require('uniqid');
    res.set('X-Request-Id',req["id"]);
    next();
}
function corsOptionsDelegate (req, callback) {
    let corsOptions = config.app.allowList.indexOf(req.header('Origin')) !== -1 ? config.app.corsOptions: config.app.corsDeniedOptions;
    callback(null, corsOptions);
}

async function configApp() {
    app.use(requestId);
    app.use(helmet());
    app.use(cors(corsOptionsDelegate));
    app.use(express.json(config.app.jsonParser));
    app.use(express.urlencoded(config.app.urlParser));
    app.use(cookieSession(config.app.cookieOptions))
    app.use(cookieParser())
    app.use(contentFilter(config.app.contentFilter));

    if (!config.app.NODE_ENV == "test") {
        app.use(morgan('combined'));
    }

    const router = await api.load();    
    app.use("/", router);
}

function setDependencyInjection(){
    app.locals.logger = logger;
    app.locals.uniqid = require('uniqid');
    app.locals.common = require('./api/common/common.controller');
    app.locals.notification = require('./api/notification/notification.controller');

    services.add("userService",UserService);
    app.locals.createHttpClient = ()=>new HttpClient();
    app.locals.userService = new UserService();
    app.locals.triggerService = new TriggerService();
    app.locals.services = services;
}

async function start() {
    try {
        configApp();
        let db = await mongoose.connect(config.db.url, config.db.options);
        app.locals.db = db.connections[0];
        setDependencyInjection();

        logger.info('database connection opened with mongoose');

        http.listen(config.app.PORT, () => {
            logger.info(`hosting: http://localhost:${config.app.PORT}`);
        });
        app.locals.startTime = new Date();
    } catch (error) {
        logger.error(error);
    }
}

let service = {
    "start": start,
    "app": app,
    "close": function (next) {
        http.close(() => console.info("server closed"));
        app.locals.db.close();
        next();
    }
}

service.start();

module.exports = service;