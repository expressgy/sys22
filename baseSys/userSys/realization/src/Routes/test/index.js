const router = require('koa-router')();

router.prefix('/test')

router.get('/', function (ctx, next) {
    ctx.body = 'this is a testes response!'
})
router.post('/', function (ctx, next) {
    console.log(ctx.request.body)
    ctx.body = 'this is a testes response!'
})

router.get('/bar', function (ctx, next) {
    ctx.body = 'this is a testes/bar response'
})

//  这里必须要使用router.routes()，多层嵌套
module.exports = router.routes()