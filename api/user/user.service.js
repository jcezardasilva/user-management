const UserModel = require('./user.model');
const AuthenticationModel = require('../authentication/authentication.model');
const ResourceModel = require('../resource/resource.model');
const Permission = require('../permission/permission.controller');
const Group = require('../group/group.controller');
const PermissionConditionModel = require('../permissionCondition/permissionCondition.model');

class UserService{
    constructor(){
        this.validateSession = validateSession;
        this.validatePermission = validatePermission;
    }
    /**
    * Recupera um usuário no banco de dados
    * @memberof CRM.Usuario
    * @protected
    * @param {string} id - Identificação do usuário
    */
    async getUser(id) {
        return await UserModel.findOne({
            id: id
        }, {
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
    }
    /**
     * Procura por grupos a partir de uma lista de IDs de grupo
     * @param {String[]} groups 
     * @memberof CRM.Usuario
     */
    async getUserGroups(groups) {
        return await Group.find({
            id: {
                $in: groups
            }
        });
    }
    createToken(req){
        let data = {
            id: req.user.id,
            email: req.body.email,
            date: new Date(new Date().toISOString())
        }
        return UserModel.createToken(data);
    }
    async saveOnHistory(req){
        let authData = new AuthenticationModel({
            id: req.app.locals.uniqid(),
            userId: req.user.id,
            authenticationMode: req.authenticationMode || "Password",
            date: new Date(new Date().toISOString())
        })
        await authData.save();
    }
    async lastLogin(req){
        let lastLogin = await AuthenticationModel.find({
            userId: req.user.id
        }).sort({
            date: -1
        }).limit(1);

        if(lastLogin){
            return lastLogin[0];
        }
        return null;
    }
    async fireLoginTrigger(req){
        let lastLogin = await req.app.locals.userService.lastLogin(req);
    
        setTimeout(async () => {
            req.app.locals.logger.info(`Disparando gatilho de login para o usuário ${req.body.email}`);
            const triggerService = req.app.locals.triggerService;
            if (!lastLogin) {
                await triggerService.fireOne(req,{
                    "event.action": "login",
                    "event.actionTime": "first",
                    "event.groupId": req.user.groups[0],
                });
            }
            else {
                await triggerService.fire(req, {
                    lastDate: lastLogin.date,
                    action: "login"
                });
            }
        }, 10000);
    }
    /**
     * Gera um token de autenticação
     * @function login
     * @memberof CRM.Usuario
     * @param {object} req - Objeto que representa uma requisição HTTP
     * @param {object} res - Objeto que representa uma resposta HTTP
     */
    async login(req) {
        this.fireLoginTrigger(req);
        let token = await this.createToken(req);
        await this.saveOnHistory(req);

        return token
    }
}

    /**
     * Verifica se um token de autenticação é válido
     * @function validateSession
     * @memberof CRM.Usuario
     * @param {object} req - Objeto que representa uma requisição HTTP
     * @param {object} res - Objeto que representa uma resposta HTTP
     */
     async function validateSession(req, res, next) {
        const userService = new UserService();
        UserModel.validateToken(req, res, async () => {
            if (req.decoded) {
                req.user = await userService.getUser(req.decoded.data.id);
                next();
            } else {
                res.status(400).json({
                    active: false,
                    message: "token inválido"
                });
            }
        })
    }
    /**
     * Verifica se as os dados do usuário e dados que ele deseja manipular se enquadram nos critérios de permissão.
     * @memberof CRM.Usuario
     * @param {object} req requisição http
     * @param {object} res retorno http
     * @param {function} next função de retorno
     */
    async function validatePermmissionConditions(req, res, next) {
        const conditionId = req.groupPermission.permissionConditionId;
        if (!conditionId) {
            return next();
        }
        const condition = await PermissionConditionModel.findOne({
            id: conditionId
        });
        if (!condition) {
            return next();
        }
        if (condition.userProperties) {
            const user = req.user;
    
            //check for user datafields
            const userDatafields = condition.userProperties.filter((item) => item.name);
    
            if (userDatafields.length > 0) {
                for (const field of userDatafields) {
                    let filtered = user.properties.filter((p) => p.id == field.id && field.value.includes(p.value));
                    if (filtered.length == 0) {
                        return res.status(400).json({
                            "errmsg": `Usuário ${req.user.id} sem as condições de permissão necessárias para o recurso ${req.baseUrl}`
                        })
                    }
                }
            }
        }
    
        if (condition.resourceProperties) {
            //check for resource datafields
            const resourceDatafields = condition.resourceProperties.filter((i) => i !== null && i.name);
            if (resourceDatafields.length > 0) {
                req.resourceConditionDataFields = resourceDatafields;
            }
            //check for resource keys
            const resourceKeys = condition.resourceProperties.filter((item) => item !== null && item.key);
            if (resourceKeys.length > 0) {
                req.resourceConditionKeys = resourceKeys;
            }
        }
    
        return next();
    }

    /**
     * Verifica se o usuário tem as permissões de acesso a um recurso
     * @function validatePermission
     * @memberof CRM.Usuario
     * @param {object} req - Objeto que representa uma requisição HTTP
     * @param {object} res - Objeto que representa uma resposta HTTP
     */
     async function validatePermission(req, res, next) {
        if (!req.user) {
            req.app.locals.logger.error(`Usuário não identificado para validar permissões ao recurso ${req.baseUrl}`);
            return res.status(400).json({
                "errmsg": `Usuário não identificado para validar permissões ao recurso ${req.baseUrl}.`
            })
        }
        let resource = await ResourceModel.findOne({
            address: req.baseUrl
        });
        if (!resource) {
            req.app.locals.logger.error(`Não foi possível identificar o recurso ${req.baseUrl}`);
            return res.status(400).json({
                "errmsg": `Não foi possível identificar o recurso ${req.baseUrl}.`
            })
        }
        const userService = new UserService();
        let groups = await userService.getUserGroups(req.user.groups);
        if (!groups) {
            req.app.locals.logger.error(`Não foi possível ler o perfil do usuário ${req.user.id} para checar permissões ao recurso ${req.baseUrl}`);
            return res.status(400).json({
                "errmsg": `Não foi possível ler o perfil do usuário ${req.user.id} para checar permissões ao recurso ${req.baseUrl}`
            })
        }
    
        let groupPermissions = groups.map((item) => item.permissions);
        groupPermissions = groupPermissions.flat();
        let activePermissions = groupPermissions.filter((item) => item.isActive);
    
        let permissionIds = activePermissions.map((item) => item.permissionId);
        let permissions = await Permission.find({
            id: {
                "$in": permissionIds
            }
        })
    
        let role = 'read';
        if (req.method !== "GET" && req.originalUrl.indexOf("/search") == -1) {
            role = 'write';
        }
    
        let userPermissions = permissions.filter((item) => resource.id == item.resourceId && item.roles.indexOf(role) > -1);
    
        if (userPermissions && userPermissions.length > 0) {
            let userPermission = userPermissions[0];
            req.userPermission = userPermission;
    
            let groupPermission = groupPermissions.filter((item) => item.permissionId == userPermission.id)
            if (groupPermission.length > 0) {
                req.groupPermission = groupPermission[0];
            }
            return validatePermmissionConditions(req, res, next);
        } else {
            req.app.locals.logger.error(`Usuário ${req.user.id} sem a permissão necessária para o recurso ${req.baseUrl}`);
            return res.status(400).json({
                "errmsg": `Usuário ${req.user.id} sem a permissão necessária para o recurso ${req.baseUrl}`
            })
        }
    }
module.exports = UserService;