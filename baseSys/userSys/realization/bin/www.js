/**
 * 引入依赖
 * */

const initConsole = require('../tools/console/index')
    , { getSystem } = require('../tools/getEnv')
    , app = require('../app')
    , http = require('http')
    , config = require('../config/default.config')
    , { createDatabase, createTables } = require('../src/Database/initDatabase')


console.time('> Web Start Use')
//  初始化console
initConsole()
console.clear();

/**
 * 环境探测
 * */
const sysEnv = getSystem()
console.dev(sysEnv)


/**
 * 初始化数据库
 * */
createDatabase().then(rec => {
    console.dev(rec)
    createTables().then(rec => {
        console.dev(rec)
    }).catch(e => {
        throw new Error(e)
    })
}).catch(e => {
    throw new Error(e)
})

/**
 * 启动服务
 * */
const server = http.createServer(app.callback());
server.listen(config.PORT)
server.on("listening", onListening)
server.on("error", onError)

//  启动
function onListening(port){
    console.info(`> Web System Name: ${config.PROJECT_NAME}`)
    console.info(`> httpServer listening in http://localhost:${config.PORT}`);
    console.timeEnd('> Web Start Use')
}

//  出错
function onError(error){
    console.error('> httpServer Error!');
    console.error(error);
    process.exit(1);
}