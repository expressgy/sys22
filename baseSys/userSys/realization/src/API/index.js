/**
 * 接口请求API
 * */

const DB = require('../Database/userBase')


//  ========================================================================================
//  用户名查重
function TcheckOnly(crb) {
    return new Promise(async (res, rej) => {
        const field = 'uuid';
        const where = [
            {'username': crb.username, 'email': crb.email/*, 'phone': crb.phone, 'person': crb.person*/, _type: 'or'}
        ]
        try {
            const result = await DB.userInfo.SELECT(field, where)
            if (result.length == 0) {
                res(global.msg.success(crb, '此用户身份可用！'))
            } else {
                rej(global.msg.failed(crb, '改用户已存在！'))
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


//  ========================================================================================

//  注册
async function signUp(ctx) {
    const crb = ctx.request.body;
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
    console.log(HASH('***1314521'))
    const crb = ctx.request.body;
    if (!crb.username && !crb.email) {
        ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
        return
    } else if (!crb.code && !crb.password) {
        ctx.body = global.msg.failed(crb, '未找到关键验证信息！')
        return
    } else {

            try {
                const field = ['email', 'uuid'];
                const where = [
                    {'username': crb.username, 'email': crb.email, _type:'or'}
                ]
                const result = await DB.userInfo.SELECT(field, where)
                if (result.length == 0) {
                    ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                    return
                } else {
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
                //  获取Token，这里已经成功了
            } catch (e) {
                ctx.body = global.msg.failed(crb, '账户验证失败，验证码不匹配！')
                return
            }
        } else if (crb.password) {
            //  密码登录
            try{
                const field = 'password';
                const where = {uuid: crb.uuid}
                const order = 'id desc limit 1'
                const result = await DB.userLogin.ORDER(field, where, order)
                if(HASH(crb.password) != result[0].password){
                    ctx.body = global.msg.failed(crb, '账户信息和密码不匹配！')
                    return
                }
                //  成功
            }catch (e) {
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
    ctx.body = crb
}

//  用户名查重
async function checkOnly(ctx) {
    const crb = ctx.request.body;
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
    switch (crb.type) {
        case 'signUp':
            if (!crb.email || !global.mail.checkEmail(crb.email)) {
                ctx.body = global.msg.failed(crb, '邮箱未输入，或格式异常！')
            } else {
                try {
                    await TcheckOnly({email: crb.email})
                } catch (e) {
                    ctx.body = global.msg.failed(crb, '此邮箱已存在！')
                    return
                }
                const code = global.getStr(global.cfg.user.sign.length)
                try {
                    const result = await global.Redis.setSignUpCode(crb.email, code)
                    if (result == 'OK') {
                        global.mail.sendMail(crb.email, code)
                        ctx.body = global.msg.success(crb, '获取验证码成功！')
                    } else {
                        const codeObj = await global.Redis.getSignUpCode(crb.email);
                        if (codeObj.time && new Date().getTime() - codeObj.time > global.cfg.RedisJSON.timeout) {
                            await global.Redis.delSignUpCode(crb.email)
                            const result2 = await global.Redis.setSignUpCode(crb.email, code);
                            if (result2 == 'ok') {
                                global.mail.sendMail(crb.email, code).then(res => {
                                    // console.log(res);
                                }).catch(e => {
                                    console.e('发送注册验证码出现错误', e);
                                })
                            } else {
                                console.dev('设置验证码到Redis失败，', result2.toString())
                                ctx.body = global.msg.failed(crb, '获取验证码失败！')
                            }
                        } else if (codeObj.time && new Date().getTime() - codeObj.time < global.cfg.RedisJSON.timeout) {
                            ctx.body = global.msg.failed(crb, '请稍后重试！')
                        } else {
                            console.dev('未知的错误，Redis无法存储。')
                            ctx.body = global.msg.failed(crb, '获取验证码失败！')
                        }
                    }
                } catch (e) {
                    console.dev('设置验证码到Redis失败。')
                    console.e(e)
                    ctx.body = global.msg.failed(crb, '获取验证码失败！')
                }
            }
            break
        case 'signIn':
            if (!crb.username && !crb.email) {
                ctx.body = global.msg.failed(crb, '未找到关键用户信息！')
                return
            }
            if (!crb.email) {
                const field = 'email';
                const where = [
                    {'username': crb.username}
                ]
                try {
                    const result = await DB.userInfo.SELECT(field, where)
                    if (result.length == 0) {
                        ctx.body = global.msg.failed(crb, '此用户信息不存在！')
                        return
                    } else {
                        crb.email = result[0].email
                    }
                } catch (e) {
                    ctx.body = global.msg.failed(crb, '查找用户信息失败！')
                    return
                }
            }
            const code = global.getStr(global.cfg.user.sign.length)
            //  存Redis
            try {
                const nowTime = new Date().getTime()
                const result = await global.Redis.getSignInCode(crb.email)
                console.log(result)
                if (nowTime - result.time > global.cfg.RedisJSON.timeout) {
                    await global.Redis.delSignInCode(crb.email)
                    await global.Redis.setSignUpCode(crb.email, code)
                    global.mail.sendMail(crb.email, code).then().catch(e => {
                        console.e('发送登录验证码出现错误', e)
                    })
                    ctx.body = global.msg.success(crb, '发送验证码成功！')
                } else {
                    ctx.body = global.msg.failed(crb, '近期已发送了一封邮件，请稍后重试！')
                }
            } catch (e) {
                try {
                    await global.Redis.setSignInCode(crb.email, code)
                    console.e('读取SignInCode Redis失败 ', e)
                    global.mail.sendMail(crb.email, code).then().catch(e => {
                        console.e('发送登录验证码出现错误', e)
                    })
                    ctx.body = global.msg.success(crb, '发送验证码成功！')
                } catch (e) {
                    console.e('读取SignInCode Redis失败 ', e)
                    ctx.body = global.msg.failed(crb, '发送验证码失败！')
                }
            }
            //  发邮件
            break
        default:
            ctx.body = global.msg.failed(crb, '请求验证码失败，用途无法匹配！')
            break
    }
}


//  需要Token的接口，查找Token不存在时，timeout：false

module.exports = {
    //  登陆前
    signUp,
    signIn,
    reset,
    checkOnly,
    sendCode
}