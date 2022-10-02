//  注册
async function signUp(ctx){
    const crb = ctx.request.body;
    //  用户名称查重
    // username，email，phone，person
    //  写用户信息
    //  加密密码
    //  写用户密码
    //  返回token
    ctx.body = crb
}
//  登录
async function signIn(ctx){
    const crb = ctx.request.body;
    ctx.body = crb
}
//  找回密码
async function reset(ctx){
    const crb = ctx.request.body;
    ctx.body = crb
}
//  用户名查重
async function checkOnly(ctx){
    const crb = ctx.request.body;
    ctx.body = crb
}
//  发送验证码
async function sendCode(ctx){
    const crb = ctx.request.body;
    ctx.body = crb
}


module.exports = {
    signUp,
    signIn,
    reset,
    checkOnly,
    sendCode
}