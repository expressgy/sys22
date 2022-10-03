/**
 * 接口请求API
 * */

const DB = require('../Database/userBase')

//  用户名查重
function TcheckOnly(crb) {
    return new Promise((res, rej) => {
        const field = 'uuid';
        const where = [
            {'username': crb.username, 'email': crb.email, 'phone': crb.phone, 'person': crb.person, _type: 'or'}
        ]
        DB.userInfo.SELECT(field, where).then(rec => {
            if (rec.length == 0) {
                res(global.msg.success(crb, '此用户身份可用！'))
            } else {
                rej(global.msg.failed(crb, '改用户已存在！'))
            }
        }).catch(e => {
            rej(global.msg.failed(crb, '查重用户时出现错误！'))
        })
    })
}

//  注册
async function signUp(ctx) {
    const crb = ctx.request.body;
    //  判断关键信息是否齐全
    if (!(crb.username || crb.email || crb.phone || crb.person) || !crb.password) {
        ctx.body = global.msg.failed(crb, '创建用户失败,缺少关键信息！')
        return
    }

    // username，email，phone，person
    //  写用户信息
    //  加密密码
    //  写用户密码
    //  返回token
    ctx.body = crb
}

//  登录
async function signIn(ctx) {
    const crb = ctx.request.body;
    ctx.body = crb
}

//  找回密码
async function reset(ctx) {
    const crb = ctx.request.body;
    ctx.body = crb
}

//  用户名查重
async function checkOnly(ctx) {
    const crb = ctx.request.body;
    try{
        const result = await TcheckOnly(crb)
        ctx.body = result
    }catch (e){
        ctx.body = e
    }
}

//  发送验证码
async function sendCode(ctx) {
    const crb = ctx.request.body;
    if(crb.type != 'signUp'){
        ctx.body = global.msg.failed(crb, '请求验证码失败，用途无法匹配！')
    }else if(!crb.email || !global.mail.checkEmail(crb.email)){
        ctx.body = global.msg.failed(crb, '邮箱未输入，或格式异常！')
    }else{
        const code = global.getStr(6)
        try{
            const result = await global.Redis.setSignUpCode(crb.email, code)
            if(result == 'OK'){
                global.mail.sendMail(crb.email,code)
                ctx.body = global.msg.success(crb, '获取验证码成功！')
            }else{
                const codeObj = await global.Redis.getSignUpCode(crb.email);
                if(codeObj.time && new Date().getTime() - codeObj.time > global.cfg.RedisJSON.timeout){
                    await global.Redis.delSignUpCode(crb.email).then(res => {
                        console.log(res);
                    }).catch(e => {
                        console.log(e);
                    })
                    const result2 = await global.Redis.setSignUpCode(crb.email, code);
                    if(result2 == 'ok'){
                        global.mail.sendMail(crb.email,code).then(res => {
                            console.log(res);
                        }).catch(e => {
                            console.log(e);
                        })
                    }else{
                        console.dev('设置验证码到Redis失败，', result2.toString())
                        ctx.body = global.msg.failed(crb, '获取验证码失败！')
                    }
                }else if(codeObj.time && new Date().getTime() - codeObj.time < global.cfg.RedisJSON.timeout){
                    ctx.body = global.msg.failed(crb, '请稍后重试！')
                }else{
                    console.dev('未知的错误，Redis无法存储。')
                    ctx.body = global.msg.failed(crb, '获取验证码失败！')
                }
            }
        }catch (e) {
            console.dev('设置验证码到Redis失败。')
            console.e(e)
            ctx.body = global.msg.failed(crb, '获取验证码失败！')
        }
    }
}


module.exports = {
    //  登陆前
    signUp,
    signIn,
    reset,
    checkOnly,
    sendCode
}