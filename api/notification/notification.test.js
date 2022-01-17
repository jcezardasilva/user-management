const model = require('./notification.test.model');

let obj = {};
obj.tests = function tests(options) {
    const it = options.it;
    const describe = options.describe;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let data ={};

    describe("notification", () => {
        it('POST - deve subscrever um usuário para receber notificações');
        it('POST - deve recuperar a chave pública para autentiicar notificações', function (done) {
            model.getVapidKey(options, (result) => {
                data.vapidkey = result;
                done();
            })
        }).timeout(tm.curto);
    })
}
module.exports = obj;