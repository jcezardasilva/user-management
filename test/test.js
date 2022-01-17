process.env.NODE_ENV = 'test'

const index = require('../index');
const app = index.app;
const chai = require('chai');
const describe = require("mocha").describe;
const it = require('mocha').it;
const config = require("../config").test;

chai.use(require('chai-http'));

let options = {
    app: app,
    chai: chai,
    config: config,
    it: it,
    describe: describe
}

describe("REST API", () => {
    require('../api/common/common.test').tests(options);
    require('../api/server/server.test').tests(options);
    require('../api/notification/notification.test').tests(options);
    require('../api/organization/organization.test').tests(options);
    require('../api/permission/permission.test').tests(options);
    require('../api/resource/resource.test').tests(options);
    require('../api/configuration/configuration.test').tests(options);
    require('../api/group/group.test').tests(options);
    require('../api/user/user.test').tests(options);
})

after((done) => {
    index.close(() => {
        console.log('endgame');
        done();
    });
});