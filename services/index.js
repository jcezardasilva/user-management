class Services {
    constructor(){
    }
    add(name,source){
        this[name] = new source();
    }
    get(name){
        return this[name];
    }
}

const services = new Services();

module.exports = services;