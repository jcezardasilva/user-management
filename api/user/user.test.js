const model = require('./user.test.model');

const resource = require('../resource/resource.test');
const permission = require('../permission/permission.test');
const org = require('../organization/organization.test');
const group = require('../group/group.test');

let obj = {};
obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;
    options.chai.should();

    let dataUser = {
        user: {
            email: "root@root",
            password: "rootPas$w0rd"
        }
    }
    let dataOrg = {
        org: {
            name: "mocha_test_org"
        }
    }
    let dataPermission = {
        permission: {
            name: "mocha_test_permission",
            description: "Permissão teste",
            level: "application",
            roles: ["full"]
        }
    }
    let dataUserResource = {
        resource: {
            name: "mocha_test_resource_user",
            description: "Recurso de teste - Todos os usuários existentes no sistema.",
            level: "group",
            address: "/user"
        }
    }
    let dataGroup = {
        group: {
            name: "mocha_test_group",
            description: "Descrição do grupo",
            permissions: []
        }
    }

    let data = {
        user: {
            name: "mocha_test_user",
            email: "testuser@mocha.com",
            password: "Pas$w0rd",
            invite: true,
            "optin": true,
            "termAccepted": true,
            "truthfulInformation": true,
            "extra": [{
                key: "origin",
                value: `http://localhost:8081`
            }]
        },
        update: {
            name: "mocha_test_user_new_name"
        }
    }

    describe("pre-user",()=>{
        it('POST - deve realizar o login de um usuário', function (done) {
            model.login(dataUser,options,(result)=>{
                dataUser.user.token = result;
                dataOrg.token = result;
                data.token = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir um novo nível de permissão', function (done) {
            permission.post(dataPermission, options, (result) => {
                dataPermission.permission.id = result;
                dataGroup.group.permission = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir um recurso', function (done) {
            resource.post(dataUserResource, options, (result) => {
                dataUserResource.resource.id = result;
                dataGroup.group.permissions.push({
                    description: "Permissão nível teste para recurso teste",
                    permissionId: dataPermission.permission.id,
                    resourceId: result
                });
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir uma organização', function (done) {
            org.post(dataOrg, options, (result) => {
                dataOrg.org.id = result;
                dataGroup.group.organization = result;
                data.user.organization = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve inserir um novo grupo', function (done) {
            group.post(dataGroup, options, (result) => {
                dataGroup.group.id = result;
                data.user.groups = [result];
                done();
            })
        }).timeout(tm.curto);
    })

    describe("user", () => {
        it('POST - deve inserir um novo usuário', function (done) {
            model.post(data, options, (result) => {
                data.user.id = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve falhar na inserção de usuário existente', function (done) {
            model.postFails(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve realizar o login de um usuário', function (done) {
            model.login(data, options, (result) => {
                data.user.token = result;
                done();
            })
        }).timeout(tm.curto);
        it('POST - deve confirmar que um token de autenticação é válido', function (done) {
            model.validateSession(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar um usuário", function (done) {
            model.get(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("GET - deve recuperar as permissões de um usuário", function (done) {
            model.getPermission(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("PUT - deve atualizar um usuário", function (done) {
            model.put(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it("DELETE - deve remover um usuário", function (done) {
            model.del(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
    })
    describe("pos-user",()=>{
        it("DELETE - deve remover um grupo", function (done) {
            group.del(dataGroup, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma organização", function (done) {
            org.del(dataOrg, options, () => {
                done();
            })
        })
        it("DELETE - deve remover uma permissão", function (done) {
            permission.del(dataPermission, options, () => {
                done();
            })
        })
        it('POST - deve remover um recurso', function (done) {
            resource.del(dataUserResource, options, () => {
                done();
            })
        }).timeout(tm.curto);
    })
}
module.exports = obj;