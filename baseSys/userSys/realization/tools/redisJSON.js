const {createClient} = require('redis')
    , {RedisJSON} = require('../config/default.config')

function initRedisJSON() {
    return new Promise(async (res, rej) => {
        const client = createClient({
            url: `redis://${RedisJSON.host}:${RedisJSON.port}`
        });
        try {
            await client.connect()
            RedisJSON.startClear ? client.flushAll() : ''
            client.select(RedisJSON.pool)
            res(client)
        } catch (e) {
            rej(e)
        }
    })
}

function Redis() {
    return new Promise(async (res, rej) => {
        try {
            const client = await initRedisJSON()
            await client.json.set('signUpCode', '$', {}, {NX: true});
            // await client.json.set('signUpCode', 'x71291@outlook.com', {
            //     code: 121212,
            //     time: new Date().getTime()
            // }, {NX: true});
            let signUpCode = 0;
            //  定时清理
            setInterval(async () => {
                if (signUpCode != 0) {
                    //  获取Keys
                    try {
                        const result = await client.json.get('signUpCode', '$')
                        console.dev('准备清理 - 查找RedisJSON signUpCode')
                    } catch (e) {
                        console.dev('准备清理 - 查找RedisJSON signUpCode 失败')
                        return
                    }
                    const nowTime = new Date().getTime()
                    //  执行清理任务
                    for (let i in result) {
                        if (nowTime - result[i].time > RedisJSON.timeout) {
                            try {
                                await client.json.del(i)
                                console.dev('清理RedisJSON signUpCode', i, '成功')
                            } catch (e) {
                                console.dev('清理RedisJSON signUpCode', i, '失败')
                            }
                        }
                    }
                }
            }, RedisJSON.clearTime)
            const RJ = {
                client,
                setSignUpCode: (user, code) => {
                    return new Promise(async (res, rej) => {
                        try {
                            res(await client.json.set('signUpCode', user, {
                                code,
                                time: new Date().getTime()
                            }, {NX: true}))
                            signUpCode++
                        } catch (e) {
                            rej(e)
                        }
                    })
                },
                getSignUpCode: (user) => {
                    return new Promise(async (res, rej) => {
                        try {
                            res(await client.json.get('signUpCode', {path:user}))
                        } catch (e) {
                            rej(e)
                        }
                    })
                },
                delSignUpCode:(user) => {
                    return new Promise(async (res, rej) => {
                        try {
                            res(await client.json.del('signUpCode', user))
                        } catch (e) {
                            rej(e)
                        }
                    })
                }
            }
            res(RJ)
        } catch (e) {
            rej(e)
        }
    })
}

module.exports = Redis