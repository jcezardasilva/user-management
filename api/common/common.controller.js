/**
 * Recursos de uso geral em diversos módulos da aplicação
 * @namespace Comum
 */
let obj = {};
/**
 * Recursos de ordenação de dados
 * @namespace Comum.Ordenacao
 * @memberof Comum
 */
obj.sort = {};
/**
 * Compara dois objetos e retorna a ordenação entre eles
 * @function compareObjects
 * @memberof Comum.Ordenacao
 * @param {object} options Opções para execução da comparação
 * @param {object} options.a Primeiro objeto da comparação
 * @param {object} options.b Segundo objeto da comparação
 * @param {String} field Nome do utilizado para comparar os dois objetos
 * @param {Number} [order] Ordem de comparação. 1 para crescente e -1 para decrescente. se não informado será considerado crescente
 * @return quando a < b : -1; quando a = b : 0; quando a > b : 1. em ordenação decrescente inverte-se os valores
 */
obj.sort.compareObjects = function (options) {
    let order = options.order || 1;
    if (options.a[options.field] < options.b[options.field]) return -order;
    if (options.a[options.field] > options.b[options.field]) return order;
    return 0;
}

/**
 * Recursos de arrays
 * @namespace Comum.Array
 * @memberof Comum
 */
obj.array = {};
/**
 * Verifica se um array contém elementos de outro array
 * @function contains
 * @memberof Comum.Array
 * @param {Array} a Array principal que será avaliado
 * @param {Array} b Array secundário cujos valores serão procurados no array principal
 */
obj.array.contains = function (a, b) {
    return a.some(r => b.indexOf(r) >= 0);
}
/**
 * Recursos de definição de dados
 * @namespace Comum.Dados
 * @memberof Comum
 */
obj.data = {}
/**
 * @summary Tipos de dados utilizados em campos de dados das entidades do sistema: ["Texto","Número","Data","Verdadeiro/Falso","Binário","Lista","Objeto"]
 * @memberof Comum.Dados
 * @alias TYPES
 */
obj.data.TYPES = ["Texto", "Número", "Data", "Verdadeiro/Falso", "Arquivo", "Lista", "Objeto"];
/**
 * Lista de níveis de dados no sistema: ["application","organization","group","user"]
 */
obj.data.LEVELS = ["application", "organization", "group", "user"];
/**
 * Lista de tipos de recurso no sistema: ["CRM","Relacionamento","Compromissos","Educação","Prêmios","Relatórios","Parcerias","Pedidos"]
 */
obj.data.RESOURCE_TYPES = ["CRM", "Relacionamento", "Compromissos", "Educação", "Prêmios", "Relatórios", "Parcerias", "Pedidos", "Conteúdos"]

/**
 * Filtro para busca de dados no banco de acordo com as permissões do usuário e escopo de organização
 * @function queryAssign
 * @memberof Comum.Dados
 */
obj.data.queryAssign = function assignQuery(req, input = {}) {
    let query = Object.assign(input);
    if (req.resourceConditionKeys) {
        for (const condition of req.resourceConditionKeys) {
            query[condition.key] = {};
            query[condition.key][`$${condition.rule}`] = condition.values;
        }
    }
    if (req.resourceConditionDataFields) {
        for (const condition of req.resourceConditionDataFields) {
            let value = Array.isArray(condition.value) ? condition.value : [condition.value];
            query = {
                "properties.id": condition.id,
                "properties.value": {
                    "$in": value
                }
            };
        }
    }
    if (req.headers.organization) {
        query = Object.assign(query, {
            "$or": [
                {
                    organizationId: req.headers.organization
                },
                {
                    "organization.id": req.headers.organization
                }
            ]
        })
    }
    return query;
}
/**
 * Associa a requisição ao escopo de uma organização
 * @param {*} req 
 * @param {*} input 
 */
obj.data.bodyAssign = function assignBody(req, input = {}) {
    let body = Object.assign(req.body,input);
    if (req.headers.organization) {
        body = Object.assign(body, {
            organizationId: req.headers.organization
        })
    }
    req.body = body;
    return body;
}


/**
 * Conjunto de recursos para realizar operações lógicas entre de dados
 * @namespace Comum.Operacoes
 * @memberof Comum
 */
obj.operations = {
    '=': (a, b) => a === b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    '!=': (a, b) => a !== b,
    '&&': (a, b) => a && b,
    '||': (a, b) => a || b,
    'contains': (a, b) => a.indexOf(b)>-1,
    'not contains': (a, b) => a.indexOf(b)===-1,
    'starts with': (a, b) => a.indexOf(b)===0,
    'not starts with': (a, b) => a.indexOf(b)!==0,
    'exists': (a) => a !== undefined && a !== null,
    'not exists': (a) => a === undefined || a === null,
    'isString': (a) => typeof a === "string",
    'isObject': (a) => typeof a === "object",
    'isNumber': (a) => !Number.isNaN(a),
};
/**
 * Conversão de operadores lógicos
 * @namespace Comum.Operadores
 * @memberof Comum
 */
obj.operators = {
    '{{and}}': '&&',
    '{{or}}': '||'
};
/**
 * Conversão de operadores lógicos para formato de banco de dados
 * @namespace Comum.Operadores.DB
 * @memberof Comum.Operadores
 */
obj.operators.db = {
    '{{abs}}': '$abs',
    '{{add}}': '$add',
    '{{addToSet}}': '$addToSet',
    '{{hour}}': '$hour',
    '{{avg}}': '$avg',
    '{{equal}}': '$eq',
    '{{lt}}': '$lt',
    '{{gt}}': '$gt',
    '{{lte}}': '$lte',
    '{{gte}}': '$gte',
    '{{ne}}': '$ne',
    '{{and}}': '$and',
    '{{or}}': '$or',
    '{{in}}': '$in',
    '{{not}}': '$not',
    '{{match}}': '$match',
    '{{project}}': '$project',
    '{{group}}': '$group',
    '{{sum}}': '$sum',
    '{{dateToString}}': '$dateToString',
    '{{size}}': '$size',
};

/**
 * Recursos genéricos para texto
 * @namespace Comum.Texto
 * @memberof Comum
 * @param {*} text 
 * @param {*} search 
 * @param {*} replacement 
 */
obj.text = {};
/**
 * Substitui todas as ocorrências de um termo dentro de uma texto.
 * @memberof Comum.Texto
 * @param {*} text 
 * @param {*} search 
 * @param {*} replacement 
 */
obj.text.replaceAll = (text, search, replacement)=>{
    return text.replace(new RegExp(search, 'g'), replacement);
};
/**
 * Transforma uma string para : caracteres minúsculos, sem acento e sem caracteres especiais
 * @function setPrivateName
 * @memberof Comum.Texto
 * @param {*} text 
 */
obj.text.setPrivateName = function(text) {
  return text.normalize("NFD").replace(/[^a-zA-Zs]/g, "").toLowerCase();
}
module.exports = obj;