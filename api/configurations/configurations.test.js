let obj = {};

obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let data = {
        configuration: {
            name: "mocha_test_configuration",
            description: "configuração teste",
            extra: [{
                key: "chave de configuração",
                value: "valor de configuração"
            }]
        },
        update: {
            description: "configuração criada para teste"
        }
    }

    describe("configuration", () => {
        it('POST - deve inserir uma configuração', function (done) {
            obj.post(data, options, (result) => {
                data.configuration.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de configuração existente', function (done) {
            obj.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar uma configuração", function (done) {
            obj.get(data, options, () => {
                done();
            })
        })
        it("POST - deve procurar por configurações", function (done) {
            obj.search(data, options, () => {
                done();
            })
        }).timeout(tm.medio);
        it("PUT - deve atualizar uma configuração", function (done) {
            obj.put(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma configuração", function (done) {
            obj.del(data, options, () => {
                done();
            })
        })
    })
}

obj.post = function post(data, options, next) {
    options.chai.request(options.app)
        .post('/configuration')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.configuration)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/configuration')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.configuration)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe uma configuração com este nome"]);
            next();
        })
}
obj.get = function get(data, options, next) {
    options.chai.request(options.app)
        .get(`/configuration/${data.configuration.id}`)
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
obj.search = function(data,options,next){
    options.chai.request(options.app)
        .post(`/configuration/search`)
        .set({
            'Content-Type': 'application/json'
        })
        .send({
            name: data.name
        })
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            next();
        })
}
obj.put = function put(data, options, next) {
    options.chai.request(options.app)
        .put(`/configuration/${data.configuration.id}`)
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
        .delete(`/configuration/${data.configuration.id}`)
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