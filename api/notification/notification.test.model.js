let obj = {};

obj.subscribe = function subscribe(data, options, next) {
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
obj.getVapidKey = function getVapidKey(options, next) {
    options.chai.request(options.app)
        .get(`/notification/vapidkey`)
        .set({
            'Content-Type': 'application/json'
        })
        .send()
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            options.expect(res.body.key).to.be.equal("BIwY9iJbRc9IYtvQLC6u1JflDJLyIO8OfRF6BqOYT29PK0sFe7fJk9ODxDDBoUJnWsqoZ5LfO9vFRoK60a5hTkc");
            next();
        })
}
module.exports = obj;