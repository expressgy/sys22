// koa-router：提供全面的路由功能，比如类似Express的app.get/post/put的写法，URL命名参数、路由命名、嵌套路由、支持加载多个中间件
// koa-bodyparser：post提交数据中间件，解析请求体时需要加载的中间件，支持x-www-form-urlencoded, application/json等格式的请求体，不支持form-data的请求体
// koa-views：对进行视图模板渲染，支持ejs, nunjucks等模板引擎
// koa-static：静态资源中间件，用作类似Nginx的静态文件服务，在本地开发时可用于加载前端文件或后端Fake数据
// koa-session：session验证，支持将会话信息存储在本地Cookie或Redis, MongoDB
// koa-jwt：token验证，路由权限控制功能，Session Base转为用Token Base
// koa-helmet：网络安全，增加Strict-Transport-Security, X-Frame-Options, X-Frame-Options等HTTP头，提高应用程序的安全性
// koa-compress：当响应体较大时，启用类似Gzip的压缩技术减少传输内容
// koa-logger：输出请求日志的功能，包括请求的url、状态码、响应时间、响应体大小等信息
// koa-convert：基于Promise的中间件和基于Generate的中间件相互转换
// koa-nunjucks-2：轻量级 Nunjucks 中间件，可以用作模板引擎，为koa应用提供页面渲染功能
// koa-favicon：页面logo加载
// koa-json：get提交数据的中间件
// koa-onerror：在服务器产生错误（throw 抛出等）后自动重定义到指定路径
// koa-respond：在Koa上下文中添加了常用的方法

/**
 * 添加依赖
 * */
const Koa = require('koa')//    主依赖 Koa2
    , logger = require('koa-logger')//  日志
    // , bodyparser = require('koa-bodyparser')//   获取body的参数，post,支持x-www-form-urlencoded, application/json等格式的请求体，不支持form-data的请求体
    , koaBody = require('koa-body')//   支持form-data，支持文件，不支持x-www-form-urlencoded，不可同时使用，

/**
 * 数据库操作
 * */
// const {
//     createDatabase,
//     createUserTable
// } = require('./src/databases/init');

global.path = __dirname

/**
 * 路由
 * */
// const router = require('./src/Routes/entry')
/**
 * 创建应用程序
 * */
const app = new Koa();
//  数据库操作
// databaseOperation()

//  请求日志
app.use(logger());
//  时间
app.use(printMethod());
//  ctx.request.body  body参数
//  已过时，被koa-body替代
// app.use(bodyparser({
//     enableTypes: ['json', 'form', 'text']
// }))
app.use(koaBody({
    multipart:true, // 支持文件上传
    encoding:'gzip',
    strict:false,//  参数:如果启用，则不解析GET，HEAD，DELETE请求，默认为true
    formidable:{
        // uploadDir:path.join(__dirname,'public/upload/'), // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize:2 * 1024 * 1024, // 文件上传大小
        // onFileBegin:(name,file) => { // 文件上传前的设置
        //     // console.log(`name: ${name}`);
        //     // console.log(file);
        // },
    }
}));
//  路由
// app.use(router.routes(), router.allowedMethods({
//     // throw: true, // 抛出错误，代替设置响应头状态
//     // notImplemented: () => '不支持当前请求所需要的功能',
//     // methodNotAllowed: () => '不支持的请求方式'
// }));


//  打印时间
function printMethod() {
    return async function (ctx, next) {
        const start = new Date()
        await next()
        const ms = new Date() - start
        console.info(`Method ${ctx.method} ${ctx.url} - ${ms}ms`)
    }
}

//  数据库操作
// async function databaseOperation() {
//     try {
//         const rec = await createDatabase()
//         console.s(rec.message)
//     } catch (e) {
//         throw new Error(e.message)
//     }
//
//     try {
//         const rec = await createUserTable()
//         const status = rec.some(itx => !itx.status)
//         if (status) {
//             throw rec
//         } else {
//             console.s('创建用户系统表成功！')
//         }
//     } catch (e) {
//         throw new Error(e.message)
//     }
// }
setTimeout(other)
function other(){
    console.w('other')
    console.w(global.path)
}
module.exports = app;