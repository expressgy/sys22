/**
 * 引入依赖
 * */

const initConsole = require('../tools/console/index')
    , {getSystem} = require('../tools/getEnv')
    , app = require('../app')
    , http = require('http')
    , config = require('../config/default.config')
    , {createDatabase, createTables} = require('../src/Database/initDatabase')
    , initRedisJSON = require('../tools/redisJSON')
    , getStr = require('../tools/RandomString')
    , makeUUID = require('../tools/uuid')
    , mail = require('../tools/mail')
    , {HASH} = require('../tools/user/encryptionString')
    , token = require('../tools/user/token')

async function run() {
    //  初始化console
    console.time('> Web Start Use');
    initConsole();
    console.clear();
    /**
     * 环境探测
     * */
    const sysEnv = getSystem();
    console.dev(sysEnv);
    /**
     * 初始化数据库
     * */
    try {
        let result = await createDatabase();
        console.s('> ' + result.message);
        result = await createTables();
        console.s('> ' + result.message);
    } catch (e) {
        console.dev(e);
        throw new Error(e)
    }
    /**
     * 初始化Redis
     * */
    try {
        global.Redis = await initRedisJSON()
    } catch (e) {
        throw new Error(e)
    }
    /**
     * 加载工具
     * */
    console.dev('> 加载工具类。')
    global.cfg = config
    global.getStr = getStr
    global.makeUUID = makeUUID
    global.mail = mail
    global.HASH = HASH
    global.token = token
    //  统一消息回复
    global.msg = {
        success: (data, message = "success") => ({data, message, status:true}),
        failed: (data, message = "failed", reStart = false) => ({data, message, reStart, status:false})
    }

    /**
     * 启动服务
     * */
    const server = http.createServer(app.callback());
    server.listen(config.PORT)
    //  启动
    server.on("listening", function onListening(port) {
        console.info(`> Web System Name: ${config.PROJECT_NAME}`)
        console.info(`> httpServer listening in http://localhost:${config.PORT}`);
        console.timeEnd('> Web Start Use')
    })
    //  出错
    server.on("error", function onError(error) {
        console.error('> httpServer Error!');
        console.error(error);
        process.exit(1);
    })
}

run()



