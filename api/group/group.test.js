const user = require('../user/user.test.model');
const org = require('../organization/organization.test');
const permission = require('../permission/permission.test');
const resource = require('../resource/resource.test');

let obj = {};
obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();
    let dataOrg = {
        org: {
            name: "mocha_test_org"
        }
    }
    let dataPermission = {
        permission: {
            name: "mocha_test_permission",
            description: "Permissão de teste - Permissão completa em nível de aplicação",
            level: "application",
            roles: ["full"]
        }
    }
    let dataGroupResource = {
        resource: {
            name: "mocha_test_resource_group",
            description: "Recurso de teste - Todos os grupos existentes no sistema.",
            level: "organization",
            address: "/group"
        }
    }
    let dataUser = {
        user: {
            email: "root@root",
            password: "rootPas$w0rd"
        }
    }
    let data = {
        group: {
            name: "mocha_test_group",
            description: "Descrição do grupo",
            permissions: []
        },
        description: {
            description: "Nova descrição para o grupo"
        }
    }

    describe("pre-group", () => {
        it('POST - deve realizar o login de um usuário', function (done) {
            user.login(dataUser,options,(result)=>{
                dataUser.user.token = result;
                dataOrg.token = result;
                data.token = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir uma organização', function (done) {
            org.post(dataOrg, options, (result) => {
                dataOrg.org.id = result;
                data.group.organization = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir um nível de permissão', function (done) {
            permission.post(dataPermission, options, (result) => {
                dataPermission.permission.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir um recurso', function (done) {
            resource.post(dataGroupResource, options, (result) => {
                dataGroupResource.resource.id = result;
                data.group.permissions.push({
                    description: "Permissão nível teste para recurso teste",
                    permissionId: dataPermission.permission.id,
                    resourceId: result
                });
                done();
            })
        }).timeout(tm.curto);
    })
    
    describe("group", () => {
        it('POST - deve inserir um novo grupo', function (done) {
            obj.post(data, options, (result) => {
                data.group.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de grupo existente', function (done) {
            obj.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar um grupo", function (done) {
            obj.get(data, options, () => {
                done();
            })
        })
        it("PUT - deve atualizar um grupo", function (done) {
            obj.put(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover um grupo", function (done) {
            obj.del(data, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma permissão", function (done) {
            permission.del(dataPermission, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma organização", function (done) {
            org.del(dataOrg, options, () => {
                done();
            })
        })
    })
    
    describe("pos-group", () => {
        it('POST - deve remover uma organização', function (done) {
            org.del(dataOrg, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve remover um nível de permissão', function (done) {
            permission.del(dataPermission, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve remover um recurso', function (done) {
            resource.del(dataGroupResource, options, () => {
                done();
            })
        }).timeout(tm.curto);
    })
}

obj.post = function post(data, options, next) {
    options.chai.request(options.app)
        .post('/group')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.group)
        .end((err, res) => {
            res.should.have.status(200);
            options.expect(err).to.be.null;
            res.body.should.be.a('object');
            next(res.body.id);
        })
}
obj.postFails = function postFails(data, options, next) {
    options.chai.request(options.app)
        .post('/group')
        .set({
            'Content-Type': 'application/json'
        })
        .send(data.group)
        .end((err, res) => {
            res.should.have.status(400);
            options.expect(err).to.be.null;
            res.body.should.be.a('array');
            options.expect(res.body).to.include.members(["já existe um grupo com este nome nessa organização"]);
            next();
        })
}
obj.get = function get(data, options, next) {
    options.chai.request(options.app)
        .get(`/group/${data.group.id}`)
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
        .put(`/group/${data.group.id}`)
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
        .delete(`/group/${data.group.id}`)
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