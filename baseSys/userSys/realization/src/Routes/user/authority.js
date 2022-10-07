/**
 * 登陆后操作
 * */

const router = require('koa-router')();
const api = require('../../API/index')

router.prefix('/authority')

//  创建权限
router.post('/createAuthority', api.createAuthority)
//  删除权限
router.del('/romveAuthority', api.romveAuthority)
//  修改权限信息
router.put('/editAuthority', api.editAuthority)
//  获取所有权限
router.get('/getAllAuthority', api.getAllAuthority)
//  添加角色权限关系
router.post('/relation/addAuthorityAndRoleRelation', api.addAuthorityAndRoleRelation)
//  删除角色权限关联
router.post('/relation/removeAuthorityAndRoleRelation', api.removeAuthorityAndRoleRelation)
//  清空当前权限的所有使用角色
router.post('/relation/clearAuthorityRole', api.clearAuthorityRole)
//  获取角色权限
router.get('/getRoleAuthority', api.getRoleAuthority)

module.exports = router.routes()