const fetch = require("node-fetch").default;

class HttpClient {
    constructor(){
        this.response_formats = [
            "json",
            "text"
        ]        
    }
    /**
     * Executa uma requisição HTTP
     * @param {object} params parâmetros da requisição
     * @param {string} params.url URL do recurso a ser consumido
     * @param {object} params.options opções da requisição
     * @param {string} params.options.method método da requisição HTTP
     * @param {string} params.response_format formato de resposta da requisição
     */
    async request({url, options,response_format="json"}){
        let response = await fetch(url,options);
        return await response[this.response_formats[response_format]]();
    }
}

module.exports = HttpClient;