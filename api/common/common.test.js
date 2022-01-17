let controller = require('./common.controller');
let obj = {};

obj.tests = function tests(options) {
    const describe = options.describe;
    const it = options.it;
    const tm = options.config.timeouts;
    options.expect = options.chai.expect;

    describe("common", () => {
        it('UNIT - deve comparar dois objetos para ordenação ascendente', function (done) {
            let data = {
                a: {
                    key: "objetoA"
                },
                b: {
                    key: "objetoB"
                },
                field: 'key',
                order: 1
            }
            obj.sort.compareObjectsAsc(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it('UNIT - deve comparar dois objetos para ordenação descendente', function (done) {
            let data = {
                a: {
                    key: "objetoA"
                },
                b: {
                    key: "objetoB"
                },
                field: 'key',
                order: -1
            }
            obj.sort.compareObjectsDesc(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
        it('UNIT - deve comparar dois objetos para ordenação sendo eles iguais', function (done) {
            let data = {
                a: {
                    key: "objetoA"
                },
                b: {
                    key: "objetoA"
                },
                field: 'key',
                order: 1
            }
            obj.sort.compareObjectsEqual(data, options, () => {
                done();
            })
        }).timeout(tm.curto);
    })
}

obj.sort = {};
obj.sort.compareObjectsAsc = function(data,options,next){
    let result = controller.sort.compareObjects(data);
    options.expect(result).be.equal(-1);
    next();
}
obj.sort.compareObjectsDesc = function(data,options,next){
    let result = controller.sort.compareObjects(data);
    options.expect(result).be.equal(1);
    next();
}
obj.sort.compareObjectsEqual = function(data,options,next){
    let result = controller.sort.compareObjects(data);
    options.expect(result).be.equal(0);
    next();
}
module.exports = obj;