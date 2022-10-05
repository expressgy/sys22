/**
 * 登陆后操作
 * */

const router = require('koa-router')();
const api = require('../../API/index')

router.prefix('/authority')

//  退出登录
router.get('/signOut', api.signOut)
//  修改用户信息
router.put('/editUserinfo', api.editUserinfo)
//  修改密码
router.put('/editPassword', api.editPassword)
//  注销用户
router.post('/writeoff', api.writeoff)
//  获取用户信息
router.get('/getuserInfo', api.getuserInfo)

module.exports = router.routes()