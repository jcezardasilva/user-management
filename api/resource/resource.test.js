let obj = {};

obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let data = {
        resource: {
            name: "mocha_test_resource",
            description: "recurso teste",
            level: "application",
            address: "/resource"
        },
        update: {
            description: "recurso criado para teste"
        }
    }

    describe("resource", () => {
        it('POST - deve inserir um novo recurso', function (done) {
            obj.post(data, options, (result) => {
                data.resource.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de recurso existente', function (done) {
            obj.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar um recurso", function (done) {
            obj.get(data, options, () => {
                done();
            })
        })
        it("PUT - deve atualizar um recurso", function (done) {
            obj.put(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover um recurso", function (done) {
            obj.del(data, options, () => {
                done();
            })
        })
    })
}

obj.post = function post(data, options, next) {
    options.chai.request(options.app)
        .post('/resource')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.resource)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            options.expect(res.body.errmsg).to.be.undefined;
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/resource')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.resource)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe um recurso com este nome"]);
            next();
        })
}
obj.get = function get(data, options, next) {
    options.chai.request(options.app)
        .get(`/resource/${data.resource.id}`)
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
        .put(`/resource/${data.resource.id}`)
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
        .delete(`/resource/${data.resource.id}`)
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