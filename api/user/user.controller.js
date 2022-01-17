/**
 * Representa os usuários do sistema, seu esquema de dados e suas ações
 * @namespace CRM.Usuario
 * @memberof CRM
 */
let obj = {};

const Model = require('./user.model');
const Resource = require('../resource/resource.model');
const mailer = require('../mailer/mailer.model');
const TemplateModel = require('../templates/templates.model');
const Group = require('../group/group.controller');
const Permission = require('../permission/permission.controller');

/**
 * Verifica se houve erros no tratamento da requisição
 * @memberof CRM.Usuario
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @return {string[]} Lista de erros identificados para envio na resposta da requisição
 */
function treatErrors(err) {
    let errors = [];
    treatErrorEmailExists(err, errors);
    treatErrorCPFExists(err, errors);
    treatErrorPasswordStrong(err, errors);
    if (errors.length == 0) {
        return err;
    }
    return errors;
}
/**
 * Verifica se houve erro de duplicidade de CPF
 * @memberof CRM.Usuario
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro
 */
function treatErrorCPFExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: cpf_1 dup key') > -1) {
        return errors.push("já existe um usuário com este CPF");
    }
}
/**
 * Verifica se houve erro de duplicidade de e-mail
 * @memberof CRM.Usuario
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {string[]} errors - lista de erros para inclusão do erro
 */
function treatErrorEmailExists(err, errors) {
    if (err.errmsg && err.errmsg.indexOf('index: email_1 dup key') > -1) {
        return errors.push("já existe um usuário com este e-mail");
    }
}
/**
 * Verifica se houve erro por senha fraca
 * @memberof CRM.Usuario
 * @protected
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido
 * @param {string[]} errors - lista de erros para inclusão do erro
 */
function treatErrorPasswordStrong(err, errors) {
    if (err.message && err.message === "A senha não atende aos requisitos: 8 caracteres ou mais; letras maiúsculas e minúsculas; números; caracteres especiais.") {
        return errors.push(err.message);
    }
}
/**
 * Emite uma resposta a uma requisição HTTP
 * @memberof CRM.Usuario
 * @protected
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} err - Objeto que representa um erro que possa ter ocorrido no tratamento da requisição HTTP
 * @param {object} data - Objeto de dados a ser enviado na resposta HTTP se não houver erros no tratamento
 */
function sendResponse(res, err, data) {
    if (err) {
        let errors = treatErrors(err);
        return res.status(400).json(errors);
    } else {
        return res.status(200).json(data);
    }
}

/**
 * Adiciona um novo usuário na aplicação
 * @function post
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.body - Objeto com o esquema de dados do de usuário
 * @param {string} req.body.name - Nome do usuário
 * @param {string} req.body.email - E-mail do usuário
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.post = async function (req, res) {
    req.app.locals.logger.info(`Adicionando um novo usuário: ${req.body.email}`);

    req.body.id = req.app.locals.uniqid();
    req.body.date = new Date(new Date().toISOString());

    req.body.organization = await Model.getOrganization(req.body.organization);
    req.body.invite = req.body.invite || false;
    req.body.optin = req.body.optin || false;

    req.body.isConfirmed = false;
    req.body.isActive = false;

    if (req.body.cpf) {
        let result = await validateCPF(req);
        if (result.body && result.body.situacao) {
            if (result.body.situacao.codigo == "0") {
                req.body.isCPFValid = true;
                req.body.serproCPFContent = result.body;

            }
        }
    }

    req.body.termAccepted = req.body.termAccepted || false;
    req.body.truthfulInformation = req.body.truthfulInformation || false;

    if (!req.body.password && req.body.invite) {
        req.body.password = Model.generatePassword();
    }
    if (!req.body.groups) {
        let group = await Model.getDefaultGroup();
        req.body.groups = [group._doc.id];
    }
    if (!req.body.organization) {
        let org = await Model.getDefaultOrganization();
        req.body.organization = org._doc;
    } else {
        req.body.organization = await Model.getOrganization(req.body.organization);
    }
    let data = new Model(req.body);
    try {
        await data.save();
        delete req.body.password;

        req.body.token = Model.createToken({
            id: data.id,
            email: data.email,
            date: new Date(new Date().toISOString())
        });
        await sendEmailConfirmation(req.body);

        req.app.locals.logger.info(`Novo usuário adicionado: ${req.body.email}`);
        sendResponse(res, null, req.body);
    } catch (error) {
        delete data.password;
        req.app.locals.logger.error(`Falha ao adicionar usuário: ${req.body.email}. ${error.message}`);
        sendResponse(res, error, data);
    }
}

/**
 * Consulta um CPF na base nacional serpro para verificar se é válido
 * @memberof CRM.Usuario
 * @protected
 * @param {object} req 
 */
async function validateCPF(req) {
    try {
        let cpf = req.body.cpf.split(".").join("").split("-").join("");

        let params = {
            url: `https://apigateway.serpro.gov.br/consulta-cpf-df-trial/v1/cpf/${cpf}`,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.SERPRO_CPF_TOKEN}`
            }
        }
        const httpClient = req.app.createHttpClient();
        let result = await httpClient.request(params)
        return result;
    } catch (error) {
        return {};
    }
}
/**
 * @summary Realiza a confirmação de cadastro para um usuário
 * @function postConfirmation
 * @memberof CRM.Usuario
 * @param {object} req 
 * @param {object} res 
 */
obj.postConfirmation = async function (req, res) {
    req.app.locals.logger.info(`Confirmando o cadastro de usuário com ID: ${req.decoded.data.id}`);
    let query = {
        id: req.decoded.data.id,
        isConfirmed: false
    }
    if (req.body.password) {
        query.invite = true;
    }
    let user = await Model.findOne(query);
    if (user) {
        if (req.body.password) {
            user.password = req.body.password;
        }
        if (req.body.termAccepted) {
            user.termAccepted = req.body.termAccepted;
        }
        if (req.body.truthfulInformation) {
            user.truthfulInformation = req.body.truthfulInformation;
        }
        user.isConfirmed = true;
        user.isActive = true;
        try {
            await user.save();
            let data = {
                message: "Cadastro confirmado com sucesso.",
                success: true
            };
            sendResponse(res, null, data);
        } catch (error) {
            req.app.locals.logger.error(`Erro ao confirmar cadastro do usuário de ID ${req.decoded.data.id}: ${error}`);
            sendResponse(res, new Error("Erro ao confirmar cadastro de usuário."), null);
        }
    } else {
        req.app.locals.logger.warn(`Pendência de confirmação não foi encontrada parao ID.${req.decoded.data.id}`);
        sendResponse(res, new Error("Não encontramos usuário com pendência de confirmação."), null);
    }
}

/**
 * Substitui todas as ocorrências de um termo dentro de um texto
 * @memberof CRM.Usuario
 * @protected
 * @param {*} text 
 * @param {*} search 
 * @param {*} replacement 
 */
function replaceAll(text, search, replacement) {
    return text.replace(new RegExp(search, 'g'), replacement);
}

/**
 * Envia um e-mail de confirmação
 * @memberof CRM.Usuario
 * @protected
 * @param {object} data 
 * @param {string} [data.templateId] ID do modelo que será usado. Se não informado será utilizado um modelo padrão.
 * @param {object} [data.properties] Lista de propriedades do usuário que são aplicadas no conteúdo da mensagem sobre tags no formato {{propriedade}}
 * @param {object} [data.extra] Lista de campos extra que serão utilizados na configuração da mensagem
 */
async function sendEmailConfirmation(data) {
    let info = mailer.analyze(data.email);
    let origin = "";
    data.extra.map((item) => {
        if (item.key == "origin") {
            origin = item.value;
        }
    })
    if (info.isValid) {
        mailer.createTransport();
        let redirectTo = `${origin}?token=${data.token}&invite=${data.invite}`;

        let template;
        if (data.templateId) {
            template = await TemplateModel.findOne({
                id: data.templateId
            })
        } else {
            template = await TemplateModel.findOne({
                isDefault: true,
                type: "E-mail"
            })
        }
        if (!template) {
            return {
                errmsg: "Modelo de mensagem não encontrado"
            }
        }

        let body = replaceAll(template.content.body, "{{redirectTo}}", redirectTo);
        if (data.properties) {
            for (const p of data.properties) {
                body = replaceAll(body, `{{${p.name}}}`, p.value);
                body = replaceAll(body, `{{${p.label}}}`, p.value);
            }
        }

        let options = {
            to: data.email,
            subject: template.content.subject,
            html: body
        }
        let result = await mailer.sendMail(options);
        return result;
    }
}


/**
 * Valida se existe um usuário para o e-mail informado e envia um e-mail
 * @function sendEmailForgot
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.sendEmailForgot = async function (req, res) {

    try {
        let info = mailer.analyze(req.body.email);
        let user = await Model.findOne({
            email: req.body.email
        }, {
            id: 1,
            name: 1,
            email: 1,
            date: 1,
            phone: 1,
        })
        let token = Model.createToken(user);

        let url = req.body.url;

        if (info.isValid) {
            mailer.createTransport();
            let options = {
                to: req.body.email,
                subject: 'Recuperar Senha',
                html: `<h1>Esqueceu sua senha?</h1><br><p>Crie uma nova senha e volte a usar o app, clique no link: <a href="${url}?&rp=true&token=${token}">Nova Senha</a></p><br><br><p>Esse link de confirmação expira após 24 horas.</p>`
            }
            let result = await mailer.sendMail(options);
            sendResponse(res, null, result);
        }
    } catch (error) {
        sendResponse(res, error, null);
    }
}

/**
 * Recupera um usuário da aplicação
 * @function get
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.get = async function (req, res) {
    const userService = req.app.locals.userService;

    let paramId;
    let userId;
    if (req.params) {
        paramId = req.params.id;
    }
    if (req.user) {
        userId = req.user.id;
    }
    let id = paramId == 0 ? userId : paramId;
    if (!id) {
        req.app.locals.logger.error(`ID de usuário não informado.`);
        return sendResponse(res, new Error("ID de usuário não informado."), null);
    }

    try {
        req.app.locals.logger.info(`Recuperando o usuário de ID ${id}`);
        let user = await userService.getUser(id);

        req.app.locals.logger.info(`Sucesso ao  recuperar o usuário de ID ${id}`);
        return sendResponse(res, null, user);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar o usuário de ID ${id}. ${error}`);
        return sendResponse(res, error, null);
    }
}

/**
 * Recupera a contagem de usuários da aplicação
 * @function countUsers
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.countUsers = async function (req, res) {

    try {
        req.app.locals.logger.info(`Recuperando contagem de usuários.`);
        let count = await Model.countDocuments();

        req.app.locals.logger.info(`Sucesso ao recuperar contagem de usuários`);
        return sendResponse(res, null, count);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar contagem de usuários`);
        return sendResponse(res, error, null);
    }
}

/**
 * Recupera uma lista de usuários no escopo de permissão do usuário autenticado
 * @function getAll
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getAll = async function (req, res) {
    req.app.locals.logger.info(`Recuperando todos os usuários no escopo de permissão do usuário de ID ${req.decoded.data.id}`);
    let query = req.app.locals.common.data.queryAssign(req);
    try {
        let data = await Model.find(query, {
            id: 1,
            name: 1,
            email: 1,
            date: 1,
            phone: 1,
            groups: 1,
            organization: 1,
            properties: 1,
            extra: 1,
            isActive: 1
        })
        req.app.locals.logger.info(`Sucesso ao recuperar usuários no escopo de permissão do usuário de ID ${req.decoded.data.id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar usuários no escopo de permissão do usuário de ID ${req.decoded.data.id}`);
        sendResponse(res, error, null);
    }
}
/**
 * Atualiza a senha de um usuário
 * @function changePassword
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} req.headers - Objeto que representa os cabeçalhos de requisição HTTP
 * @param {string} req.authorization - Token de autorização de acesso
 * @param {object} req.body - Objeto que representa o corpo de requisição HTTP
 * @param {string} req.body.password - Nova senha do usuário
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.changePassword = async function (req, res) {
    req.app.locals.logger.info(`Atualizando o usuário de ID ${req.params.id}`);

    try {
        if (!req.decoded) {
            return sendResponse(res, new Error("Usuário não informado"), null);
        }
        let data = await Model.findOne({
            id: req.decoded.data.id
        })
        if (!data) {
            return sendResponse(res, new Error("Usuário não encontrado"), null);
        }

        data.password = req.body.password;
        await data.save();
        req.app.locals.logger.info(`Sucesso ao atualizar senha para o usuário de ID ${req.decoded.data.id}`);
        sendResponse(res, null, {
            success: true,
            message: "Nova senha salva"
        });
    } catch (error) {
        req.app.locals.logger.error(`Falha ao atualizar senha para o usuário de ID ${req.decoded.data.id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Atualiza um usuário
 * @function put
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.put = async function (req, res) {
    req.app.locals.logger.info(`Atualizando o usuário de ID ${req.params.id}`);

    req.body.organization = await Model.getOrganization(req.body.organization);
    try {
        let data = await Model.updateOne({
            id: req.params.id,
            isActive: false
        }, {
            $set: req.body
        });
        if (data.n == 0) {
            req.app.locals.logger.info(`Sucesso ao atualizar o usuário de ID ${req.params.id}`);
            return sendResponse(res, {
                ok: false,
                "errmsg": "somente cadastros pendentes podem ser alterados."
            }, null);

        }
        req.app.locals.logger.info(`Sucesso ao atualizar o usuário de ID ${req.params.id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao atualizar o usuário de ID ${req.params.id}. ${error}`);
        sendResponse(res, error, null);
    }
}
/**
 * Remomve um usuário
 * @function delete
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.delete = async function (req, res) {
    let id = req.params.id == 0 ? req.user.id : req.params.id;

    req.app.locals.logger.info(`Removendo o usuário de ID ${req.params.id}`);
    try {
        let data = await Model.deleteOne({
            id: id
        });
        req.app.locals.logger.info(`Sucesso ao remover o usuário de ID ${req.params.id}`);
        sendResponse(res, null, data);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao remover o usuário de ID ${req.params.id}`);
        sendResponse(res, error, null);
    }
}

/**
 * Valida se existe um usuário para o e-mail informado
 * @function validateEmail
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} next - Próxima função chamada quando o e-mail for válido
 */
obj.validateEmail = async function (req, res, next) {
    try {
        let doc = await Model.findOne({
            email: req.body.email
        }, {
            id: 1,
            email: 1,
            groups: 1
        })
        if (doc && doc.id) {
            req.user = doc;
            req.app.locals.logger.info(`Endereço de e-mail correto: ${req.body.email}`);
            next();
        } else {
            req.app.locals.logger.error(`Endereço de e-mail inválido: ${req.body.email}`);
            res.status(400).json({
                errmsg: "e-mail inválido!"
            });
        }
    } catch (error) {
        return res.status(500).json({ errmsg: "Falha ao validar e-mail" });
    }
}

/**
 * Valida se a senha informada para o usuário é válida
 * @function validatePassword
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 * @param {object} next - Próxima função chamada quando a senha for válida
 */
obj.validatePassword = function (req, res, next) {
    Model.findOne({
        id: req.user.id
    }, (err, user) => {
        user.validatePassword(req.body.password, (isPasswordValid) => {
            if (isPasswordValid) {
                req.user.isPasswordValid = true;
                req.app.locals.logger.info(`Senha correta para o usuário ${req.user.id}`);
                next();
            } else {
                req.app.locals.logger.error(`Senha inválida para o usuário ${req.user.id}`);
                res.status(400).json({
                    errmsg: "senha inválida!"
                });
            }
        })
    })
}

/**
 * Gera um token de autenticação
 * @function login
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.login = async function (req, res) {
    if (req.user) {
        const userService = req.app.locals.userService;
        let token = await userService.login(req);

        req.app.locals.logger.info(`Token de acesso gerado com sucesso para o usuário ${req.user.id}`);
        return res.status(200).json({
            token: token
        });
    } else {
        req.app.locals.logger.error(`Autenticação inválida para o e-mail ${req.body.email}`);
        return res.status(400).json({
            errmsg: "autenticação inválida!"
        });
    }
}

/**
 * Verifica se um token de autenticação é válido
 * @function getSession
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getSession = async function (req, res) {
    const userService = req.app.locals.userService;
    Model.validateToken(req, res, async () => {
        if (req.decoded) {
            req.user = await userService.getUser(req.decoded.data.id);
            res.status(200).json({
                active: true,
                message: "sessão ativa"
            });
        } else {
            res.status(400).json({
                active: false,
                message: "token inválido"
            });
        }
    })
}
/**
 * Procura por grupos a partir de uma lista de IDs de grupo
 * @param {String[]} groups 
 * @memberof CRM.Usuario
 */
async function getUserGroups(groups) {
    return await Group.find({
        id: {
            $in: groups
        }
    });
}
/**
 * Procura por permissões a partir de uma lista de IDs de permissão
 * @param {String[]} permissions 
 * @memberof CRM.Usuario
 */
async function getUserPermissions(permissions) {
    return await Permission.find({
        id: {
            $in: permissions
        }
    });
}

/**
 * Recupera as permissões de um usuário.
 * @function getPermission
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getPermission = async function (req, res) {
    try {
        let userPermissions = await getUserPermission(req);
        res.status(200).json(userPermissions);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar lista de permissões do usuário ${req.user.id}`);
        res.status(400).json(error);
    }
}

async function getUserPermission(req) {
    req.app.locals.logger.info(`Recuperando lista de permissões do usuário ${req.user.id}`);
    let groups = await getUserGroups(req.user.groups);
    let permissions = groups[0].permissions.filter((item) => item.isActive);
    permissions = permissions.map((item) => item.permissionId);
    req.app.locals.logger.info(`Sucesso ao recuperar lista de permissões do usuário ${req.user.id}`);
    return await getUserPermissions(permissions);
}

/**
 * Recupera as permissões de um usuário.
 * @function getPermission
 * @memberof CRM.Usuario
 * @param {object} req - Objeto que representa uma requisição HTTP
 * @param {object} res - Objeto que representa uma resposta HTTP
 */
obj.getPermissionByResourceName = async function (req, res) {
    let resourceName;
    try {
        if (req.params) {
            resourceName = req.params.resourceName;
        }
        let resource = await Resource.findOne({
            name: resourceName
        })
        let userPermissions = await getUserPermission(req);
        let permissions = userPermissions.filter((item) => item.resourceId === resource.id);
        res.status(200).json(permissions);
    } catch (error) {
        req.app.locals.logger.error(`Falha ao recuperar lista de permissões do usuário ${req.user.id} pelo resourceName: ${resourceName}`);
        res.status(400).json(error);
    }
}
/**
 * Busca usuários para determinados critérios
 * @function find
 * @memberof CRM.Usuario
 * @param {object} query - Objeto com critérios de busca
 * @return {object[]} lista de objetos de permissão
 */
obj.find = async function (query) {
    return new Promise((resolve, reject) => {
        Model.find(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}

/**
 * Procura por valores em uma propriedade
 * @param {*} req 
 * @param {*} res 
 */
obj.searchPropertyValue = async function (req, res) {
    let name = req.body.name || req.query.name;
    let value = req.body.value || req.query.value;
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome da propriedade não informado."
        })
    }
    if (!value) {
        return res.status(400).json({
            errmsg: "Valor da propriedade não informado."
        })
    }
    try {
        let query = {
            'properties.name': req.body.name,
            'properties.value': new RegExp(`^${req.body.value}`)
        };
        let projection = {
            _id: 0,
            properties: {
                $elemMatch: {
                    name: req.body.name
                }
            }
        };
        let data = await Model.find(query, projection);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
/**
 * Recupera valores distintos de um campo
 * @param {*} req 
 * @param {*} res 
 */
obj.getFieldValues = async function (req, res) {
    let name = req.body.name || req.query.name;
    let value = req.body.value || req.query.value;
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome do campo não informado."
        })
    }
    if (!value) {
        return res.status(400).json({
            errmsg: "Valor do campo não informado."
        })
    }
    try {
        let query = {};
        query[req.body.name] = new RegExp(`^${req.body.value}`)

        let data = await Model.distinct(req.body.name, query);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}
/**
 * Recupera Valores de uma propriedade
 * @param {*} req 
 * @param {*} res 
 */
obj.getPropertyValues = async function (req, res) {
    let name = req.body.name || req.query.name;
    if (!name) {
        return res.status(400).json({
            errmsg: "Nome da propriedade não informado."
        })
    }
    try {
        let query = {
            'properties.name': req.body.name
        };
        let projection = {
            _id: 0,
            properties: {
                $elemMatch: {
                    name: req.body.name
                }
            }
        };
        let data = await Model.find(query, projection);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json(error);
    }
}

module.exports = obj;