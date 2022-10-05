/**
 * 登陆后操作
 * */

const router = require('koa-router')();
const api = require('../../API/index')

router.prefix('/role')

//  创建角色
router.post('/createRole', api.createRole)
//  删除角色
router.del('/deleteRoleList', api.deleteRoleList)
//  修改角色信息
router.put('/editRole', api.editRole)
//  获取全部角色列表
router.get('/getAllRoleList', api.getAllRoleList)
//  获取个人角色列表
router.get('/getPersonalRoleIdList', api.getPersonalRoleIdList)
//  添加用户角色关联
router.post('/relation/addRoleAndUserRelation', api.addRoleAndUserRelation)
//  删除用户角色关联
router.post('/realtion/romoveRoleAndUserRelation', api.romoveRoleAndUserRelation)

module.exports = router.routes()