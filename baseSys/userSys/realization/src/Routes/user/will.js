/**
 * 登录前操作
 * */
const router = require('koa-router')();
const api = require('../../API/index')

router.prefix('/will')

//  注册
router.post('/signUp', api.signUp)
//  登录
router.post('/signIn', api.signIn)
//  找回密码
router.post('/reset', api.reset)
//  用户名查重
router.get('/checkOnly', api.checkOnly)
//  发送验证码
router.get('/sendCode', api.sendCode)

module.exports = router.routes()