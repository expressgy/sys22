//  用户登陆表
const router = require('koa-router')();

//  全局路由
router.prefix('/api')

//  统一消息恢复

global.msg = {
    success: (data, message = "success", status = true) => {
        return {
            data,
            message,
            status
        }
    },
    failed: (data, message = "failed", status = false) => {
        return {
            data,
            message,
            status
        }
    }
}

router.use(
    //  用户系统
    require('./user/index'),
    //  测试系统
    require('./test/index'),
)
router.get('/', async ctx => {
    ctx.body = 'sys22_userSys API!'
})

module.exports = router

/**
 *
 router.get('/', async ctx => {
    console.log('query'.green, ctx.query)
    // console.log('body'.green, ctx.request.body)
    // Get请求只能传Query参数，POST可以传Query和Body（常用）两种形式的参数。
    ctx.body = 'Hello World';
})
 router.post('/', async ctx => {
    console.log('query'.green, ctx.query)
    console.log('body'.green, ctx.request.body)
    ctx.body = 'Hello World';
})

 // 调用router.routes()来组装匹配好的路由，返回一个合并好的中间件
 // 调用router.allowedMethods()获得一个中间件，当发送了不符合的请求时，会返回 `405 Method Not Allowed` 或 `501 Not Implemented`
 app.use(router.routes());
 app.use(router.allowedMethods({
    // throw: true, // 抛出错误，代替设置响应头状态
    // notImplemented: () => '不支持当前请求所需要的功能',
    // methodNotAllowed: () => '不支持的请求方式'
}));
 * */