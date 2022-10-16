/**
 * 接口请求API
 * */

const DB = require('../Database/userBase')
//  ==================================公共方法=================================================
//#region
//  用户名查重
function TcheckOnly(crb) {
    return new Promise(async (res, rej) => {
        const field = 'uuid';
        const where = [
            {'username': crb.username, 'email': crb.email/*, 'phone': crb.phone, 'person': crb.person*/, _type: 'or'},
            {'status': 1, _type: 'and'}
        ]
        try {
            const result = await DB.userInfo.SELECT(field, where)
            if (result.length == 0) {
                res(global.msg.success(crb, '此用户身份可用！'))
            } else {
                rej(global.msg.failed(crb, '该用户已存在！'))
            }
        } catch (e) {
            rej(global.msg.failed(e, '查重用户时出现错误！'))
        }
    })
}

//  生成Token
function TmakeToken(uuid) {
    return new Promise(async (res, rej) => {
        const token = global.token.encrypt({
            uuid,
            date: new Date().getTime()
        })
        try {
            global.Redis.setLogin(uuid, token)
            res(token)
        } catch (e) {
            rej(e)
        }
    })
}

//  发送验证码
function TsendCode(crb) {
    return new Promise(async (res, rej) => {
        let type = crb.type
        type = type.trim()
        if (['signUp', 'signIn', 'reset', 'writeoff'].indexOf(type) == -1) {
            rej(global.msg.failed(crb, '不存在验证码请求类型！'))
            return
        }
        type = type.replace(type[0], type.split("")[0].toUpperCase())
        const aSet = 'set' + type + 'Code'
        const aGet = 'get' + type + 'Code'
        const aDel = 'del' + type + 'Code'

        //  生成Code
        const code = global.getStr(global.cfg.user.sign.length)
        //  存Redis
        //  查看是否存在
        try {
            const nowTime = new Date().getTime()
            const result = await global.Redis[aGet](crb.email)
            // 存在
            if (nowTime - result.time > global.cfg.RedisJSON.timeout) {
                //  过期
                await global.Redis[aDel](crb.email)
                await global.Redis[aSet](crb.email, code)
                global.mail.sendMail(crb.email, code, crb.type).then().catch(e => {
                    console.e(`发送${type}Code出现错误`, e)
                })
                res(global.msg.success(crb, '发送验证码成功！'))
            } else {
                //  还可用
                rej(global.msg.failed(crb, '近期已发送了一封邮件，请稍后重试！'))
                return
            }
        } catch (e) {
            //  不存在，或者报错
            try {
                await global.Redis[aSet](crb.email, code)
                global.mail.sendMail(crb.email, code, crb.type).then().catch(e => {
                    console.e(`发送${type}Code邮件出现错误`, e)
                })
                res(global.msg.success(crb, '发送验证码成功！'))
            } catch (e) {
                //  存储出现错误
                console.e(`写入${type}Code出现错误 `, e)
                rej(global.msg.failed(crb, '发送验证码失败！'))
                return
            }
        }
    })
}

//  精简对象
function CompactObjects(obj) {
    for (let i in obj) {
        if (!obj[i]) {
            delete obj[i]
        }
    }
}

//  获取密码
function getPassword(uuid) {
    return new Promise(async (res, rej) => {
        try {
            const field = 'password';
            const where = {uuid}
            const order = 'id desc limit 1'
            const result = await DB.userLogin.ORDER(field, where, order)
            res(result[0].password)
        } catch (e) {
            rej(e)
        }
    })
}

//  获取个人角色列表
function TgetPersonalRoleIdList(crb) {
    const page = Math.abs(Number(crb.page) || 1)
        , pageSize = Math.abs(Number(crb.pageSize) || 10)
        , uuid = crb.uuid
    return new Promise(async (res, rej) => {
        const field = '*'
        const limit = [(page - 1) * pageSize, page * pageSize]
        const where = {uuid}
        try {
            const result = await DB.userRelationRole.LIMIT(field, limit, where)
            const count = await DB.userRelationRole.COUNT('id', where)
            res({data: result, count: count[0]['COUNT(id)'], page, pageSize})
        } catch (e) {
            console.e(`获取个人角色列表失败,数据库错误`, e)
            rej(e)
        }
    })
}

//  获取角色权限
function TgetRoleAuthority(crb) {
    return new Promise(async (res, rej) => {
        if (!crb.roleId) {
            res('缺少必要参数!');
            return
        }

        try {
            if(!crb.page && !crb.pageSize){
                const SQL = await DB.SQL.sql.query(`SELECT * from user_authority where id in (select authority_id from user_relation_authority where role_id = ${crb.roleId})`)
                console.log(SQL)
                console.log(await DB.SQL.exec('select authority_id from user_relation_authority where role_id = 6'))
                const result2 = await DB.SQL.exec(SQL)
                res(result2)
            }else{
                const page = Math.abs(Number(crb.page) || 1)
                    , pageSize = Math.abs(Number(crb.pageSize) || 10)
                    , limit = [(page - 1) * pageSize, page * pageSize]
                const SQL = await DB.SQL.sql.query(`SELECT * from user_authority where id in (select authority_id from user_relation_authority where role_id = ${crb.roleId}) LIMIT ${limit}`)
                const COUNTSQL = await DB.SQL.sql.query(`SELECT  COUNT(id) from user_authority where id in (select authority_id from user_relation_authority where role_id = ${crb.roleId}) LIMIT ${limit}`)
                const result2 = await DB.SQL.exec(SQL)
                const COUNTSQL_result = await DB.SQL.exec(COUNTSQL)
                res({data:result2,count: COUNTSQL_result[0]['COUNT(id)'], page, pageSize})
            }
        } catch (e) {
            rej({message: '获取角色权限错误', e})
        }
    })
}

//#endregion
//  ========================================================================================

//  ****************************************************登陆前接口********************************************************
//#region
//  注册
async function signUp(ctx) {
    const crb = ctx.request.body;
    crb.username = crb.username?.trim()
    crb.password = crb.password?.trim()
    crb.code = crb.code?.trim()
    crb.email = crb.email?.trim()
    //  判断关键信息是否齐全
    try {
        const result = await TcheckOnly(crb)
    } catch (e) {
        ctx.body = e
        return
    }
    if (!crb.email) {
        ctx.body = global.msg.failed(crb, '缺少关键信息，未找到邮箱！')
    } else if (!crb.password || crb.password?.toString().trim().length < 8) {
        ctx.body = global.msg.failed(crb, '密码未输入或密码长度过短！')
    } else if (!crb.code) {
        ctx.body = global.msg.failed(crb, '未找到邮箱验证！')
    } else {
        try {
            const result = await global.Redis.getSignUpCode(crb.email)
            if (result.code != crb.code?.toString().trim().toUpperCase() || new Date().getTime() - result.time > global.cfg.RedisJSON.timeout) {
                // if(false){
                ctx.body = global.msg.failed(crb, '邮箱验证码不匹配！')
            } else {

                const uuid = global.makeUUID()
                const createtime = new Date().getTime()
                //  用户表信息
                const userInfo = {
                    uuid: uuid,
                    username: crb.username,
                    person: crb.person,
                    phone: Number(crb.phone) || 0,
                    email: crb.email,
                    createtime
                }

                //  登陆表信息
                const userLogin = {
                    uuid: uuid,
                    password: HASH(crb.password),
                    createtime
                }
                //  用户其他信息表信息
                const userInfoOther = {
                    uuid: uuid,
                    personal: crb.personal,
                    address: crb.address,
                    country: crb.country,
                    sex: Number(crb.sex) || 0,
                    birthday: Number(crb.birthday) || 0,
                    nickname: crb.nickname,
                    personal: crb.personal,
                    slogan: crb.slogan,
                    avatar: crb.avatar,
                    background: crb.background,
                    updatetime: createtime
                }

                try {
                    await DB.userInfo.INSERT(userInfo)
                    await global.Redis.delSignUpCode(crb.email)
                    await DB.userInfoOther.INSERT(userInfoOther)
                    await DB.userLogin.INSERT(userLogin)

                    try {
                        const token = await TmakeToken(uuid)
                        ctx.body = global.msg.success({
                            tokenStatus: true,
                            token
                        }, '注册成功！')
                    } catch (e) {
                        ctx.body = global.msg.success({
                            tokenStatus: false
                        }, '注册成功！')
                    }
                } catch (e) {
                    console.dev(e)
                    ctx.body = global.msg.failed(crb, '注册失败！')
                }
            }
        } catch (e) {
            ctx.body = global.msg.failed(crb, '邮箱验证码不匹配！')
        }
    }
    // username，email，phone，person
    //  写用户信息
    //  加密密码
    //  写用户密码
    //  返回token
}
//  登录
async function signIn(ctx) {
    const crb = ctx.request.body;
    crb.username = crb.username?.trim()
    crb.password = crb.password?.trim()
    crb.code = crb.code?.trim()
    crb.email = crb.email?.trim()
    if (!crb.username && !crb.email) {
        ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
        return
    } else if (!crb.code && !crb.password) {
        ctx.body = global.msg.failed(crb, '未找到关键验证信息！')
        return
    } else {

        try {
            const field = ['email', 'uuid', 'status'];
            const where = [
                {'username': crb.username, 'email': crb.email, _type: 'or'}
            ]
            const result = await DB.userInfo.SELECT(field, where)
            if (result.length == 0) {
                ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                return
            } else {
                if (result[0].status == 0) {
                    ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                    return
                }
                crb.email = result[0].email
                crb.uuid = result[0].uuid
            }
        } catch (e) {
            ctx.body = global.msg.failed(crb, '查找用户信息失败！')
            return
        }

        if (crb.code) {
            //  验证码登录
            try {
                const nowTime = new Date().getTime()
                const result = await global.Redis.getSignInCode(crb.email)
                await global.Redis.delSignInCode(crb.email)
                if (nowTime - result.time > global.cfg.RedisJSON.timeout) {
                    ctx.body = global.msg.failed(crb, '账户验证失败，验证码已过期！')
                    return
                }
                if (result.code != crb.code?.toString().trim().toUpperCase()) {
                    ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
                    return
                }
                //  获取Token，这里已经成功了
            } catch (e) {
                //  未查到
                ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
                return
            }
        } else if (crb.password) {
            //  密码登录
            try {
                const mustPassword = await getPassword(crb.uuid)
                if (HASH(crb.password) != mustPassword) {
                    ctx.body = global.msg.failed(crb, '账户信息和密码不匹配！')
                    return
                }
                //  成功
            } catch (e) {
                console.e('查找用户密码出错', e)
                ctx.body = global.msg.failed(crb, '账户验证失败，系统错误！')
                return
            }
        }
        const token = await TmakeToken(crb.uuid)
        ctx.body = global.msg.success({
            tokenStatus: true,
            token
        }, '登陆成功！')
    }
}
//  找回密码
async function reset(ctx) {
    const crb = ctx.request.body;
    crb.username = crb.username?.trim()
    crb.password = crb.password?.trim()
    crb.code = crb.code?.toString().trim().toUpperCase()
    crb.email = crb.email?.trim()
    //  判断是否存在账户信息
    //  检查是否存在用户名或者密码
    if (!crb.username && !crb.email) {
        ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
        return
    }
    //  判断是否存在新密码
    if (!crb.newpassword) {
        ctx.body = global.msg.failed(crb, '缺少新密码！')
        return
    }
    //  是否存在Code
    if (!crb.code) {
        ctx.body = global.msg.failed(crb, '不存在验证码！')
        return
    }
    //  获取uuid
    try {
        const field = ['email', 'uuid', 'username'];
        const where = [
            {'username': crb.username, 'email': crb.email, _type: 'or'}
        ]
        const result = await DB.userInfo.SELECT(field, where)
        if (result.length == 0) {
            ctx.body = global.msg.failed(crb, '此用户信息不存在！')
            return
        } else {
            crb.email = result[0].email
            crb.uuid = result[0].uuid
            crb.username = result[0].username
        }
    } catch (e) {
        ctx.body = global.msg.failed(crb, '查找用户信息失败！')
        return
    }
    //  验证验证码信息
    try {
        const nowTime = new Date().getTime()
        const result = await global.Redis.getResetCode(crb.email)
        if (nowTime - result.time > global.cfg.RedisJSON.timeout) {
            ctx.body = global.msg.failed(crb, '账户验证失败，验证码已过期！')
            return
        }
        if (result.code != crb.code?.toString().trim().toUpperCase()) {
            ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
            return
        }
        try {
            await global.Redis.delResetCode(crb.email)
        } catch (e) {
            console.e('无法删除重置密码Code Redis', e)
            ctx.body = global.msg.failed(crb, '账户验证失败，系统错误！')
        }

        //  这里已经验证成功
    } catch (e) {
        //  未查到
        console.e('查找重置密码Code失败，Redis', e)
        ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
        return
    }
    //  设置新的密码
    const userLogin = {
        uuid: crb.uuid,
        password: HASH(crb.newpassword),
        createtime: new Date().getTime()
    }
    try {
        await DB.userLogin.INSERT(userLogin)
        ctx.body = global.msg.success({tokenStatus: false}, '找回账户成功')
    } catch (e) {
        console.e('创建新密码失败，重置密码', e)
        ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
    }
}
//  用户名查重
async function checkOnly(ctx) {
    const crb = ctx.request.body;
    crb.username = crb.username?.trim()
    crb.password = crb.password?.trim()
    crb.code = crb.code?.trim()
    crb.email = crb.email?.trim()
    try {
        const result = await TcheckOnly(crb)
        ctx.body = result
    } catch (e) {
        ctx.body = e
    }
}
//  发送验证码
async function sendCode(ctx) {
    const crb = ctx.request.body;
    crb.username = crb.username?.trim()
    crb.password = crb.password?.trim()
    crb.code = crb.code?.trim()
    crb.email = crb.email?.trim()
    switch (crb.type) {
        case 'signUp':
            if (!crb.email || !global.mail.checkEmail(crb.email)) {
                ctx.body = global.msg.failed(crb, '邮箱未输入，或格式异常！')
                return
            }
            try {
                await TcheckOnly({email: crb.email})
            } catch (e) {
                ctx.body = global.msg.failed(crb, '此邮箱已存在！')
                return
            }
            try {
                const result = await TsendCode(crb)
                ctx.body = result
            } catch (e) {
                ctx.body = e
            }
            //  as12
            break
        case 'signIn':
            //  检查是否存在用户名或者密码
            if (!crb.username && !crb.email) {
                ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
                return
            }
            //  获取Email
            if (!crb.email) {
                const field = 'email';
                const where = [{'username': crb.username}]
                try {
                    const result = await DB.userInfo.SELECT(field, where)
                    if (result.length == 0) {
                        ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                        return
                    } else {
                        crb.email = result[0].email
                    }
                } catch (e) {
                    console.e(`查找${type}Code email出现错误：${crb.username}`, e)
                    ctx.body = global.msg.failed(crb, '查找用户信息失败！')
                    return
                }
            }
            try {
                const result = await TsendCode(crb)
                ctx.body = result
            } catch (e) {
                ctx.body = e
            }
            break
        case 'reset':
            //  检查是否存在用户名或者密码
            if (!crb.username && !crb.email) {
                ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
                return
            }
            //  获取Email
            if (!crb.email) {
                const field = 'email';
                const where = [{'username': crb.username}]
                try {
                    const result = await DB.userInfo.SELECT(field, where)
                    if (result.length == 0) {
                        ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                        return
                    } else {
                        crb.email = result[0].email
                    }
                } catch (e) {
                    console.e(`查找${type}Code email出现错误：${crb.username}`, e)
                    ctx.body = global.msg.failed(crb, '查找用户信息失败！')
                    return
                }
            }
            try {
                const result = await TsendCode(crb)
                ctx.body = result
            } catch (e) {
                ctx.body = e
            }
            break
        case 'writeoff':
            //  获取Email
            if (!crb.email) {
                const field = 'email';
                const where = [{'username': crb.username}]
                try {
                    const result = await DB.userInfo.SELECT(field, where)
                    if (result.length == 0) {
                        ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                        return
                    } else {
                        crb.email = result[0].email
                    }
                } catch (e) {
                    console.e(`查找${type}Code email出现错误：${crb.username}`, e)
                    ctx.body = global.msg.failed(crb, '查找用户信息失败！')
                    return
                }
            }
            try {
                const result = await TsendCode(crb)
                ctx.body = result
            } catch (e) {
                console.e(e.message)
                ctx.body = e
            }
            break
        default:
            ctx.body = global.msg.failed(crb, '请求验证码失败，用途无法匹配！')
            break
    }
}
//#endregion
//  -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*登陆前接口-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


//  ####################################################登陆后用户信息接口##################################################
//#region
//  退出登录
async function signOut(ctx) {
    try {
        await global.Redis.delLogin(ctx.uuid, ctx.token)
        ctx.body = global.msg.success({}, '退出登陆成功！')
    } catch (e) {
        console.e('退出登陆失败 ', e)
        ctx.body = global.msg.failed({}, '退出登陆失败！')
    }
}
//  修改用户信息
async function editUserinfo(ctx) {
    const crb = ctx.request.body;
    try {
        const createtime = new Date().getTime()
        //  用户表信息
        const userInfo = {
            person: crb.person,
            phone: Number(crb.phone) || 0,
            createtime
        }
        //  用户其他信息表信息
        const userInfoOther = {
            personal: crb.personal,
            address: crb.address,
            country: crb.country,
            sex: crb.sex ? Number(crb.sex) || 0 : undefined,
            birthday: crb.birthday ? Number(crb.birthday.toString().slice(0, 8)) || 0 : undefined,
            nickname: crb.nickname,
            personal: crb.personal,
            slogan: crb.slogan,
            avatar: crb.avatar,
            background: crb.background,
            updatetime: createtime
        }
        CompactObjects(userInfo)
        CompactObjects(userInfoOther)
        const where = {uuid: ctx.uuid}
        await DB.userInfo.UPDATE(userInfo, where)
        await DB.userInfoOther.UPDATE(userInfoOther, where)
        ctx.body = global.msg.success({}, '修改信息成功！')
    } catch (e) {
        console.e('修改信息失败！', e)
        ctx.body = global.msg.failed({e}, '修改信息失败！')
    }
}
//  修改密码
async function editPassword(ctx) {
    const crb = ctx.request.body;
    if (!crb.oldpassword || !crb.newpassword) {
        ctx.body = global.msg.failed({}, '缺少关键信息！')
        return
    } else if (crb.oldpassword == crb.newpassword) {
        ctx.body = global.msg.failed({}, '请保持新旧密码的差异性！')
        return
    }
    try {
        const mustPassword = await getPassword(ctx.uuid)
        if (HASH(crb.oldpassword) != mustPassword) {
            ctx.body = global.msg.failed({}, '原始密码不匹配！')
        } else {
            try {
                //  登陆表信息
                const userLogin = {
                    uuid: ctx.uuid,
                    password: HASH(crb.newpassword),
                    createtime: new Date().getTime()
                }
                await DB.userLogin.INSERT(userLogin)
                await signOut(ctx)
                ctx.body = global.msg.success({}, '修改密码成功！')
            } catch (e) {
                console.e('写入用户新密码出错', e)
                ctx.body = global.msg.failed({}, '修改密码出现意外，系统错误！')
                return
            }
        }
    } catch (e) {
        console.e('查找用户密码出错', e)
        ctx.body = global.msg.failed({}, '账户验证失败，系统错误！')
        return
    }
}
//  注销用户
async function writeoff(ctx) {
    const crb = ctx.request.body;
    if (!crb.code) {
        ctx.body = global.msg.failed({}, '缺少关键信息！')
        return
    }
    const field = 'email';
    const where = [{'uuid': ctx.uuid}]
    try {
        const result = await DB.userInfo.SELECT(field, where)
        console.log(result)
        if (result.length == 0) {
            ctx.body = global.msg.failed(crb, '此用户邮箱不存在！')
            return
        } else {
            crb.email = result[0].email
        }
    } catch (e) {
        console.e(`查找writeoffCode email出现错误：`, e)
        ctx.body = global.msg.failed(crb, '查找用户邮箱失败！')
        return
    }
    try {
        const result = await global.Redis.getWriteoffCode(crb.email)
        console.log(result)
        if (result.code == crb.code || new Date().getTime() - result.time > global.cfg.RedisJSON.timeout) {
            const data = {
                status: 0,
            }
            const where = {uuid: ctx.uuid}
            try {
                await DB.userInfo.UPDATE(data, where)
            } catch (e) {
                console.e(e)
                ctx.body = global.msg.failed(crb, '注销账户失败，系统错误！')
                return
            }
            await signOut(ctx)
            ctx.body = global.msg.success(crb, '注销账户成功！')
            global.Redis.delWriteoffCode(crb.email)
        } else {
            ctx.body = global.msg.failed(crb, '注销账户的验证码不匹配！')
        }
    } catch (e) {
        console.e(`无法匹配注销账户的验证码，系统错误：`, e)
        if (e.toString().indexOf('not exist') > -1) {
            ctx.body = global.msg.failed(crb, '注销账户的验证码不匹配！')
        } else {
            ctx.body = global.msg.failed(crb, '无法匹配注销账户的验证码，系统错误！')
        }
    }

}
//  获取用户信息
async function getuserInfo(ctx) {

}

//#endregion
//  -#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#登陆后用户信息接口-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#

//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^角色^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//#region
//  创建角色
async function createRole(ctx) {
    const crb = ctx.request.body;
    if (!crb.roleName || !crb.roleRemarks) {
        ctx.body = global.msg.failed(crb, '缺少关键信息！')
        return
    }
    const userRole = {
        role_name: crb.roleName,
        role_remarks: crb.roleRemarks
    }
    const field = '*'
    const where = {...userRole, _type: 'or'}
    try {
        const result = await DB.userRole.SELECT(field, where)
        if (result.length > 0) {
            ctx.body = global.msg.failed(result, '创建角色失败，已存在相关角色信息！')
            return
        }
    } catch (e) {
        console.e('查重角色信息失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '创建角色失败，系统错误！')
        return
    }
    try {
        await DB.userRole.INSERT(userRole)
    } catch (e) {
        console.e('写入角色失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '创建角色失败，系统错误！')
        return
    }
    ctx.body = global.msg.success(crb, '创建角色成功！')
}
//  删除角色
async function deleteRoleList(ctx) {
    const crb = ctx.request.body;
    if (!crb.roleIdList) {
        ctx.body = global.msg.failed(crb, '缺少关键信息！')
        return
    }
    try {
        if (!Array.isArray(crb.roleIdList)) {
            const result = await DB.userRole.DELETE({id: Number(crb.roleIdList) || 0})
            console.log(result)
        } else {
            const result = await DB.userRole.DELETEINID(crb.roleIdList.join(','))
            console.log(result)
        }
        ctx.body = global.msg.success({}, '删除角色成功！')
    } catch (e) {
        console.e('删除角色失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '删除角色失败，系统错误！')
    }
}
//  修改角色信息
async function editRole(ctx) {
    const crb = ctx.request.body;
    if (!crb.roleId || !crb.roleName || !crb.roleRemarks) {
        ctx.body = global.msg.failed(crb, '缺少关键信息！')
        return
    }
    const userRole = {
        role_name: crb.roleName,
        role_remarks: crb.roleRemarks
    }
    const where = {id: crb.roleId}

    const field = '*'
    const where2 = {...userRole, _type: 'or'}
    try {
        const result = await DB.userRole.SELECT(field, where2)
        if (result.length <= 1 && result[0]?.id == crb.roleId) {
            ctx.body = global.msg.failed(result, '修改角色信息失败，已存在相关角色信息！')
            return
        } else if (result.length > 1) {
            ctx.body = global.msg.failed(result, '创建角色信息失败，已存在相关权限信息！')
            return
        }
    } catch (e) {
        console.e('查重角色信息失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '修改角色信息失败，系统错误！')
        return
    }
    try {
        await DB.userRole.UPDATE(userRole, where)
        ctx.body = global.msg.success({}, '修改角色信息成功！')
    } catch (e) {
        console.e('修改角色信息失败,数据库错误', e)
        ctx.body = global.msg.failed({}, '修改角色信息失败，系统错误！')
    }
}
//  获取全部角色列表
async function getAllRoleList(ctx) {
    const crb = ctx.request.body;
    const page = Math.abs(Number(crb.page) || 0)
        , pageSize = Math.abs(Number(crb.pageSize) || 10)

    const field = '*'
    const limit = [page * pageSize, (page + 1) * pageSize]
    const where = ''
    try {
        const result = await DB.userRole.LIMIT(field, limit, where)
        const count = await DB.userRole.COUNT('id', where)
        ctx.body = global.msg.success({data: result, count: count, page, pageSize}, '获取全部角色列表成功！')
    } catch (e) {
        console.e(`获取全部角色列表失败,数据库错误`, e)
        ctx.body = global.msg.failed({}, '获取全部角色列表失败,系统错误！')
    }
}
//  获取个人角色列表
async function getPersonalRoleIdList(ctx) {
    const crb = ctx.request.body;
    if (!crb.uuid) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    try {
        const result = await TgetPersonalRoleIdList(crb)
        ctx.body = global.msg.success(result, '获取个人角色列表成功！')
    } catch (e) {
        ctx.body = global.msg.failed({}, '获取个人角色列表失败,系统错误！')
    }
}
//  添加用户角色关联
async function addRoleAndUserRelation(ctx) {
    const crb = ctx.request.body;
    if (!crb.uuidList || !crb.roleIdList) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    if (!Array.isArray(crb.uuidList) || !Array.isArray(crb.roleIdList)) {
        ctx.body = global.msg.failed(crb, '参数类型必须为数组！')
        return
    }
    const roleRelationList = []
    for (let i of (crb.uuidList)) {
        for (let j of crb.roleIdList) {
            roleRelationList.push({uuid: i, role_id: j})
        }
    }
    try{
        //  查重
        const exist = DB.SQL.sql.query(`SELECT * from user_relation_role where (uuid, role_id) in (${(DB.SQL.sql.table('b').data(roleRelationList).insert()).split('VALUES ')[1]})`)
        const check = await DB.SQL.exec(exist)
        if(check.length !=0){
            let deleteList = []
            for(let i in roleRelationList){
                for(let j of check){
                    if(roleRelationList[i].uuid == j.uuid && roleRelationList[i].role_id == j.role_id){
                        deleteList.push(i)
                    }
                }
            }
            deleteList = deleteList.reverse()
            for(let i of deleteList){
                roleRelationList.splice(i, 1)
            }
        }
    }catch (e) {
        console.e('添加用户角色关联失败,查重失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '添加用户角色关联失败，系统错误！')
    }
    try {
        if(roleRelationList.length != 0){
            await DB.userRelationRole.INSERT(roleRelationList)
        }
        ctx.body = global.msg.success({}, '添加用户角色关联成功！')
    } catch (e) {
        console.e('添加用户角色关联失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '添加用户角色关联失败，系统错误！')
    }
}
//  删除用户角色关联
async function romoveRoleAndUserRelation(ctx) {
    const crb = ctx.request.body;
    if (!crb.roleRelationIdList) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    if (!Array.isArray(crb.roleRelationIdList)) {
        ctx.body = global.msg.failed(crb, '参数类型必须为数组！')
        return
    }
    try {
        await DB.userRelationRole.DELETEINID(crb.roleRelationIdList.join(','))
        ctx.body = global.msg.success({}, '删除用户角色关联成功！')
    } catch (e) {
        console.log('添加用户角色关联失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '删除用户角色关联失败，系统错误！')
    }
}
//#endregion
//  -^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^角色-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-

//  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@权限@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//#region
//  创建权限
async function createAuthority(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityName
        || !crb.type
        || !crb.authorityRemarks) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    const userAuthority = {
        authority_name: crb.authorityName,
        type: Number(crb.type) || 0,
        grade: Number(crb.grade) || -1,
        sequence: Number(crb.sequence) || 99,
        authority_remarks: crb.authorityRemarks,
    }
    const field = '*'
    const userAuthorityCheck = {
        authority_name: crb.authorityName,
        authority_remarks: crb.authorityRemarks,
    }
    try {
        const result = await DB.userAuthority.SELECT(field, userAuthorityCheck)
        if (result.length > 0) {
            ctx.body = global.msg.failed(result, '创建权限失败，已存在相关权限信息！')
            return
        }
    } catch (e) {
        console.e('查重权限信息失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '创建权限失败，系统错误！')
        return
    }
    try {
        await DB.userAuthority.INSERT(userAuthority)
        ctx.body = global.msg.success({}, '创建权限成功！')
    } catch (e) {
        console.log('创建权限失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '创建权限失败，系统错误！')
    }
}

//  删除权限
async function romveAuthority(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityIdList) {
        ctx.body = global.msg.success(crb, '缺少必要参数！')
        return
    }
    if (!Array.isArray(crb.authorityIdList)) {
        ctx.body = global.msg.success(crb, '参数类型错误！')
        return
    }
    try {
        const result = await DB.userAuthority.DELETEINID(crb.authorityIdList.join(','))
        ctx.body = global.msg.success({}, '删除权限成功！')
    } catch (e) {
        console.e('删除权限失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '删除权限失败，系统错误！')
    }
}

//  修改权限信息
async function editAuthority(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityId || !crb.authorityName || !crb.type || !crb.authorityRemarks) {
        ctx.body = global.msg.failed(crb, '缺少关键信息！')
        return
    }
    const userAuthority = {
        authority_name: crb.authorityName,
        type: Number(crb.type) || 0,
        grade: Number(crb.grade) || -1,
        sequence: Number(crb.sequence) || 99,
        authority_remarks: crb.authorityRemarks,
    }
    const where = {id: crb.authorityId}
    const userAuthorityCheck = {
        authority_name: crb.authorityName,
        authority_remarks: crb.authorityRemarks,
    }
    try {
        const result = await DB.userAuthority.SELECT(field, userAuthorityCheck)
        if (result.length <= 0 && result[0]?.id == crb.authorityId) {
            ctx.body = global.msg.failed(result, '创建权限失败，已存在相关权限信息！')
            return
        } else if (result.length > 1) {
            ctx.body = global.msg.failed(result, '创建权限失败，已存在相关权限信息！')
            return
        }
    } catch (e) {
        console.e('查重权限信息失败，数据库错误。', e)
        ctx.body = global.msg.failed(crb, '创建权限失败，系统错误！')
        return
    }
    try {
        await DB.userAuthority.UPDATE(userAuthority, where)
        ctx.body = global.msg.success({}, '修改权限信息成功！')
    } catch (e) {
        console.e('修改权限信息失败,数据库错误', e)
        ctx.body = global.msg.failed({}, '修改权限信息失败，系统错误！')
    }

}

//  获取所有权限
async function getAllAuthority(ctx) {
    const crb = ctx.request.body;
    ctx.body = global.msg.success(crb, '缺少必要参数！')
    const page = Math.abs(Number(crb.page) || 0)
        , pageSize = Math.abs(Number(crb.pageSize) || 10)

    const field = '*'
    const limit = [page * pageSize, (page + 1) * pageSize]
    const where = ''
    try {
        const result = await DB.userAuthority.LIMIT(field, limit, where)
        const count = await DB.userAuthority.COUNT('id', where)
        ctx.body = global.msg.success({data: result, count: count, page, pageSize}, '获取所有权限列表成功！')
    } catch (e) {
        console.e(`获取所有权限列表失败,数据库错误`, e)
        ctx.body = global.msg.failed({}, '获取所有权限列表失败,系统错误！')
    }
}

//  添加角色权限关系
async function addAuthorityAndRoleRelation(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityIdList || !crb.roleIdList) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    if (!Array.isArray(crb.authorityIdList) || !Array.isArray(crb.roleIdList)) {
        ctx.body = global.msg.failed(crb, '参数类型必须为数组！')
        return
    }
    const authorityRelationList = []
    for (let i of (crb.roleIdList)) {
        for (let j of crb.authorityIdList) {
            authorityRelationList.push({role_id: i, authority_id: j})
        }
    }
    try{
        //  查重
        const SQL = DB.SQL.sql.table('user_relation_authority').data(authorityRelationList).insert().split('VALUES ')[1]
        const checkSQL = DB.SQL.sql.query(`select * from user_relation_authority where (role_id, authority_id) in (${SQL})`)
        const check = await DB.SQL.exec(checkSQL);
        if(check.length !=0){
            let deleteList = []
            for(let i in authorityRelationList){
                for(let j of check){
                    if(authorityRelationList[i].role_id == j.role_id && authorityRelationList[i].authority_id == j.authority_id){
                        deleteList.push(i)
                    }
                }
            }
            deleteList = deleteList.reverse()
            for(let i of deleteList){
                authorityRelationList.splice(i, 1)
            }
        }
    }catch (e) {
        ctx.body = global.msg.failed({}, '添加角色权限关联失败，系统错误！')
        console.e('添加角色权限关联失败,查重错误，数据库错误', e)
    }
    try {
        if(authorityRelationList.length != 0){
            await DB.userRelationAuthority.INSERT(authorityRelationList)
        }
        ctx.body = global.msg.success({}, '添加角色权限关联成功！')
    } catch (e) {
        console.e('添加角色权限关联失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '添加角色权限关联失败，系统错误！')
    }

}

//  删除角色权限关联
async function removeAuthorityAndRoleRelation(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityRelationIdList) {
        ctx.body = global.msg.failed(crb, '缺少必要参数！')
        return
    }
    if (!Array.isArray(crb.authorityRelationIdList)) {
        ctx.body = global.msg.failed(crb, '参数类型必须为数组！')
        return
    }
    try {
        await DB.userRelationRole.DELETEINID(crb.authorityRelationIdList.join(','))
        ctx.body = global.msg.success({}, '删除角色权限关联成功！')
    } catch (e) {
        console.log('添加角色权限关联失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '删除角色权限关联失败，系统错误！')
    }
}

//  清空当前权限的所有使用角色
async function clearAuthorityRole(ctx) {
    const crb = ctx.request.body;
    if (!crb.authorityId) {
        ctx.body = global.msg.success(crb, '缺少必要参数！')
    }
    const where = {authority_id: crb.authorityId}
    try {
        await DB.userRelationAuthority.DELETE(where)
        ctx.body = global.msg.success({}, '清空权限所有使用角色成功！')
    } catch (e) {
        console.log('清空权限所有使用角色失败，数据库错误', e)
        ctx.body = global.msg.failed({}, '清空权限所有使用角色失败，系统错误！')
    }

}

//  获取角色权限
async function getRoleAuthority(ctx) {
    const crb = ctx.request.body;
    try {
        const result = await TgetRoleAuthority(crb)
        console.log(result)
        ctx.body = global.msg.success(result, '获取角色权限成功！')
    } catch (err) {
        const {message, e} = err;
        console.e('查找角色权限错误，数据库错误!', e)
        ctx.body = global.msg.failed(crb, '查找角色权限错误,系统错误！')
    }

}

//#endregion
//  -@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@权限@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@-@

module.exports = {
    //  登陆前----------------------
    signUp,
    signIn,
    reset,
    checkOnly,
    sendCode,
    //  登陆后----------------------
    //  用户信息侧￥￥￥￥￥￥￥￥￥￥￥￥
    signOut,
    editUserinfo,
    editPassword,
    writeoff,
    getuserInfo,
    //  角色 ^^^^^^^^^^^^^^^^^^^^^^^
    createRole,
    deleteRoleList,
    editRole,
    getAllRoleList,
    getPersonalRoleIdList,
    addRoleAndUserRelation,
    romoveRoleAndUserRelation,
    //  权限
    createAuthority,
    romveAuthority,
    editAuthority,
    getAllAuthority,
    addAuthorityAndRoleRelation,
    removeAuthorityAndRoleRelation,
    clearAuthorityRole,
    getRoleAuthority,
}