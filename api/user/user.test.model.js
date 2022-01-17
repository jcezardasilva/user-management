let obj = {};

obj.post = function post(data, options, next) {
    options.chai.request(options.app).post('/user')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.user)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/user')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.user)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe um usuário com este e-mail"]);
            next();
        })
}
obj.login = function login(data, options, next) {
    options.chai.request(options.app)
        .post('/user/login')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.user)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            options.expect(res.body.token).to.be.a("string");
            next(res.body.token);
        })
}
obj.validateSession = function validateSession(data, options, next) {
    options.chai.request(options.app)
        .post('/user/session')
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.user.token
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next();
        })
}
obj.get = function get(data,options, next) {
    options.chai.request(options.app)
        .get(`/user/${data.user.id}`)
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.user.token
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            options.expect(res.body.email).to.be.equal("testuser@mocha.com");
            next();
        })
}
obj.getPermission = function(data,options,next){
    options.chai.request(options.app)
        .post(`/user/permission`)
        .set({
            'Content-Type': 'application/json',
            "Authorization": data.user.token
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            next();
        })
}
obj.put = function put(data,options, next) {
    options.chai.request(options.app)
        .put(`/user/${data.user.id}`)
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
obj.del = function del(data,options, next) {
    options.chai.request(options.app)
        .delete(`/user/${data.user.id}`)
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