const {createClient} = require('redis')
    , {RedisJSON, maxClientOnline, user} = require('../config/default.config')

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
            await client.json.set('login', '$', {}, {NX: true});
            await client.json.set('signInCode', '$', {}, {NX: true});
            // await client.json.set('signUpCode', 'x71291@outlook.com', {
            //     code: 121212,
            //     time: new Date().getTime()
            // }, {NX: true});
            let signUpCode = 0;
            //  定时清理
            setInterval(async () => {
                //  清理signUpCOde
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

                //  清理UUID
                try {
                    await clearLoginArr(client)
                    console.dev('清理UUID成功')
                } catch (e) {
                    console.dev('清理UUID发生异常', e)
                }

                //  清理登录Code
                try{
                    await clearSignInCode(client)
                }catch (e) {
                    console.dev('清理登录Code发生异常', e)
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
                            res(await client.json.get('signUpCode', {path: user}))
                        } catch (e) {
                            rej(e)
                        }
                    })
                },
                delSignUpCode: (user) => {
                    return new Promise(async (res, rej) => {
                        try {
                            res(await client.json.del('signUpCode', user))
                        } catch (e) {
                            rej(e)
                        }
                    })
                },
                setLogin: (uuid, token) => {
                    return setLogin(client, uuid, token)
                },
                getLogin: (uuid) => {
                    return getLogin(client, uuid)
                },
                delLogin: (uuid, token) => {
                    return delLogin(client, uuid, token)
                },
                getToken: (token) => {
                    return getToken(client, token)
                },
                // clearLoginArr: () => {
                //     return clearLoginArr(client)
                // },
                setSignInCode:(email, code) => {
                    return setSignInCode(client, email, code)
                },
                getSignInCode:(email, code) => {
                    return getSignInCode(client, email)
                },
                delSignInCode:(email, code) => {
                    return delSignInCode(client, email)
                },
            }
            res(RJ)
        } catch (e) {
            rej(e)
        }
    })
}
//  ===============================================UUID && Token========================================================
//  login,用于同账号的登陆数量，获取UUID下的TokenList
function getLogin(client, uuid) {
    return new Promise(async (res, rej) => {
        try {
            const result = await client.json.get('login', {path: uuid})
            res(result)
        } catch (e) {
            if (e.toString().indexOf('not exist') > -1) {
                res([])
            } else {
                rej(e)
            }
        }
    })
}
//  添加UUID下的Token
function setLogin(client, uuid, token) {
    return new Promise(async (res, rej) => {
        try {
            const nowTime = new Date().getTime()
            const result = await getLogin(client, uuid)
            if (result.length == 0) {
                await client.json.set('login', uuid, [{token, time: nowTime}])
                await setToken(client, token, uuid)
                res()
            } else if (result.length < maxClientOnline) {
                await client.json.ARRAPPEND('login', uuid, {token, time: nowTime})
                await setToken(client, token, uuid)
                res()
            } else {
                //  已经达到最大值了
                for (let i = result.length - 1; i >= 0; i--) {
                    if (nowTime - result[i].time > user.login.timeLimit) {
                        await delLoginArr(client, uuid, i, result[i].token)
                    }
                }
                await client.json.ARRAPPEND('login', uuid, {token, time: nowTime})
                await setToken(client, token, uuid)
                res()
            }
        } catch (e) {
            console.log(e);
            rej(e)
        }
    })
}
//  删除UUID List中的占用的Token
function delLoginArr(client, uuid, index, token) {
    return new Promise(async (res, rej) => {
        try {
            await client.json.ARRPOP('login', uuid, index)
            await delToken(client, token)
            res()
        } catch (e) {
            rej(e)
        }

    })
}
//  退出登录时删除UUID下的Token
function delLogin(client, uuid, token){
    return new Promise(async (res, rej) => {
        try{
            const result = await getLogin(client, uuid)
            for(let i = result.length - 1; i >= 0 ; i--){
                if(result[i].token == token){
                    await delLoginArr(client, uuid, i, token)
                    await delToken(client, token)
                }
            }
            res()
        }catch (e) {
            rej(e)
        }
    })
}
//  清理过期的UUID下的Token
function clearLoginArr(client) {
    return new Promise(async (res, rej) => {
        const result = await client.json.get('login')
        const nowTime = new Date().getTime()
        try {
            for (let i in result) {
                const list = result[i];
                for (let j = list.length - 1; j >= 0; j--) {
                    if (nowTime - list[j].time > user.login.timeLimit) {
                        await delLoginArr(client, i, j, list[j].token)
                    }
                }
            }
            res()
        } catch (e) {
            rej(e)
        }

    })
}
//  获取Token的UUID
function getToken(client, token) {
    return new Promise(async (res, rej) => {
        try {
            const result = await client.get(token)
            res(result)
        } catch (e) {
            if (e.toString().indexOf('not exist') > -1) {
                res([])
            } else {
                rej(e)
            }
        }
    })
}
//  添加Token键值对，在添加UUID时，同步添加
function setToken(client, token, uuid) {
    return new Promise(async (res, rej) => {
        try {
            await client.set(token, uuid)
            res()
        }catch (e) {
            rej()
        }
    })
}
//  删除Token键值对,在删除UUID时，同步删除
function delToken(client, token) {
    return new Promise(async (res, rej) => {
        try{
            await client.del(token)
            res()
        }catch (e) {
            rej()
        }
    })
}
//  ===============================================UUID && Token========================================================
//
// async function test() {
//     const R = await Redis()
//     await R.setLogin('uuid1', 'token11')
//     await R.setLogin('uuid1', 'token12')
//     await R.setLogin('uuid1', 'token13')
//     await R.setLogin('uuid1', 'token14')
//     await R.setLogin('uuid1', 'token15')
//     console.log(await R.getLogin('uuid1'))
//     await R.delLogin('uuid1', 'token15')
//     console.log(await R.getLogin('uuid1'))
//     // await R.setLogin('uuid1', 'token16')
//     // await R.setLogin('uuid1', 'token17')
//     // await R.setLogin('uuid1', 'token18')
//     // await R.setLogin('uuid1', 'token19')
//     // await R.setLogin('uuid1', 'token10')
//     // await R.setLogin('uuid2', 'token21')
//     // await R.setLogin('uuid2', 'token22')
//     // await R.setLogin('uuid2', 'token273')
//     // await R.setLogin('uuid2', 'token23')
//     // await R.setLogin('uuid2', 'token24')
//     // await R.setLogin('uuid2', 'token25')
//     // await R.setLogin('uuid2', 'token26')
//     // await R.setLogin('uuid2', 'token27')
//     // await R.setLogin('uuid2', 'token28')
//     // await R.clearLoginArr()
//     // console.log(await R.getToken('token21'));
//     // console.log(await R.getLogin('uuid1'));
//     // console.log(await R.getLogin('uuid2'));
//     // console.log('end')
// }


// test()
//  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>UUID && Token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//  写入登录Code
function setSignInCode(client, email, code){
    return new Promise(async (res, rej) => {
        try{
            const time = new Date().getTime()
            await client.json.set('signInCode', email, {code, time}, {NX:true})
            res()
        }catch (e) {
            rej(e)
        }
    })
}
//  读取登录Code
function getSignInCode(client, email){
    return new Promise(async (res, rej) => {
        try{
            const result = await client.json.get('signInCode', {path: email})
            res(result)
        }catch (e) {
            rej(e)
        }
    })
}
//  删除登录Code
function delSignInCode(client, email){
    return new Promise(async (res, rej) => {
        try{
            const result = await client.json.del('signInCode', email)
            res(result)
        }catch (e) {
            rej(e)
        }
    })
}
//  清理登录COde
function clearSignInCode(client){
    return new Promise(async (res, rej) => {
        try{
            const nowTime = new Date().getTime()
            const result = await client.json.get('signInCode')
            for(let i in result){
                if(nowTime - result[i].time > RedisJSON.timeout){
                    await delSignInCode(client, i)
                }
            }
            res()
        }catch (e) {
            rej(e)
        }
    })

}

module.exports = Redis