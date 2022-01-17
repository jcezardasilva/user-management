require('dotenv').config();
const crypto = require('crypto');
const PORT = process.env.PORT || 8081;

let obj = {
    "app": {
        "name": "user-management",
        "SERVER": process.env.SERVER || `http://localhost:${PORT}`,
        "PORT": PORT,
        "NODE_ENV": process.env.NODE_ENV || "dev",
        "allowList": ['http://localhost:4200','http://localhost:8080', 'http://localhost:8081'],
        "jsonParser": {
            "limit": '15mb',
            "type": 'application/json'
        },
        "urlParser":{
            extended: true
        },
        "corsOptions": {
            "origin": true,
            "credentials": true,
            "methods": "GET,POST,PUT,DELETE,HEAD,OPTIONS",
            "allowedHeaders": "Access-Control-Allow-Headers, Access-Control-Request-Headers, Access-Control-Request-Method, Origin,Accept, X-Requested-With, Content-Type, Authorization, Organization"
        },
        "corsDeniedOptions": {
            "origin": false
        },
        "contentFilter": {
            "urlBlackList": ['&&'],
            "urlMessage": 'A forbidden expression has been found in URL: ',
            "bodyBlackList": ['$ne', '$eq', '$lt', '$gt', '$in', '||'],
            "bodyMessage": 'A forbidden expression has been found in body data: ',
            "dispatchToErrorHandler": false,
            "appendFound": true
        },
        "cookieOptions": {
            "name": 'session',
            "keys": [crypto.randomBytes(32).toString('hex')],
            "maxAge": 86400 * 1000
        }
    },
    "db": {
        "url": process.env.CUSTOMCONNSTR_MONGODB || "mongodb://localhost:27017/user-management",
        "options": {
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }
    },
    "test": {
        "user": {
            "user": process.env.API_TESTER_USER,
            "password": process.env.API_TESTER_PASS
        },
        "timeouts": {
            "curto": 2000,
            "medio": 7000,
            "longo": 15000
        }
    },
    "mailer": {
        "service": process.env.EMAIL_SERVICE || "gmail",
        "auth": {
            "user": process.env.EMAIL_USER,
            "pass": process.env.EMAIL_PASSWORD
        }
    }
};

module.exports = obj;