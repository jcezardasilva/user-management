const glob = require("glob");
let obj = {};
/**
 * Realiza a leitura de arquivos de roteador nas subpastas da API.
 */
async function searchRouters(){
    return new Promise((resolve,reject)=>{
        let options = {
        }
        glob(__dirname + "/**/*router.js",options, function (err, files) {
            if(err){
                reject(err);
            }
            resolve(files);
        })
    })
}
/**
 * Carrega todos os roteadores da API dinamicamente.
 */
obj.load = async function(){
    const router = require('express').Router();
    router.use('/',require('./server/server.router'));

    let files = await searchRouters();
    
    for(const file of files){
        let name = file.split('.')[0].split("/").reverse()[0];
        let routerName = file.split("/").reverse()[0];
        let routeName = `/${name}`;
        let routePath = `${__dirname}/${name}/${routerName}`;
        router.use(routeName,require(routePath));
    }
    return router;
}

module.exports = obj;