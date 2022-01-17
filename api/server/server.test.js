let obj = {};

obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    describe("server", () => {
        it("GET - deve retornar o status do servidor", function (done) {
            obj.get(options, () => {
                done();
            })
        }).timeout(tm.curto);
    })
}

obj.get = function get(options, next) {
    options.chai.request(options.app)
        .get('/')
        .set({
            'Content-Type': 'application/json'
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            options.expect(res.body.message).to.be.equal("servidor ativo!");
            next();
        })
}
module.exports = obj;