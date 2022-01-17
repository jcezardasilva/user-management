let obj = {};

obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let data = {
        permission: {
            name: "mocha_test_permission",
            description: "Permissão teste",
            level: "application",
            roles: ["full"]
        },
        update: {
            description: "Permissão criada para teste"
        }
    }

    describe("permission", () => {
        it('POST - deve inserir um novo nível de permissão', function (done) {
            obj.post(data, options, (result) => {
                data.permission.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de permissão existente', function (done) {
            obj.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar uma permissão", function (done) {
            obj.get(data, options, () => {
                done();
            })
        })
        it("PUT - deve atualizar uma permissão", function (done) {
            obj.put(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma permissão", function (done) {
            obj.del(data, options, () => {
                done();
            })
        })
    })
}

obj.post = function post(data, options, next) {
    options.chai.request(options.app)
        .post('/permission')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.permission)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/permission')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.permission)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe uma permissão com este nome"]);
            next();
        })
}
obj.get = function get(data, options, next) {
    options.chai.request(options.app)
        .get(`/permission/${data.permission.id}`)
        .set({
            'Content-Type': 'application/json'
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
        .put(`/permission/${data.permission.id}`)
        .set({
            'Content-Type': 'application/json'
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
        .delete(`/permission/${data.permission.id}`)
        .set({
            'Content-Type': 'application/json'
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