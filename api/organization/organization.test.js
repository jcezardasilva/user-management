const user = require('../user/user.test.model');

let obj = {};
obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let data = {
        org: {
            name: "mocha_test_org"
        },
        update: {
            owner: "mocha_test_user"
        }
    }
    let dataUser = {
        user: {
            email: "root@root",
            password: "rootPas$w0rd"
        }
    }
    describe("pre-organization",()=>{
        it('POST - deve realizar o login de um usuário', function (done) {
            user.login(dataUser,options,(result)=>{
                dataUser.user.token = result;
                data.token = result;
                done();
            })
        }).timeout(tm.curto);
    })
    describe("organization", () => {
        it('POST - deve inserir uma nova organização', function (done) {
            obj.post(data, options, (result) => {
                data.org.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de organização existente', function (done) {
            obj.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar uma organização", function (done) {
            obj.get(data, options, () => {
                done();
            })
        })
        it("PUT - deve atualizar uma organização", function (done) {
            obj.put(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma organização", function (done) {
            obj.del(data, options, () => {
                done();
            })
        })
    })
}

obj.post = function post(data, options, next) {
    options.chai.request(options.app)
        .post('/org')
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.token
        })
        .send(data.org)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/org')
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.token
        })
        .send(data.org)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe uma organização com este nome"]);
            next();
        })
}
obj.get = function get(data, options, next) {
    options.chai.request(options.app)
        .get(`/org/${data.org.id}`)
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.token
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next();
        })
}
obj.put = function put(data, options, next) {
    options.chai.request(options.app)
        .put(`/org/${data.org.id}`)
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.token
        })
        .send(data.update)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next();
        })
}
obj.del = function del(data, options, next) {
    options.chai.request(options.app)
        .delete(`/org/${data.org.id}`)
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.token
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next();
        })
}
module.exports = obj;