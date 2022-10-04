const {createClient} = require('redis')
    , {RedisJSON, maxClientOnline, user} = require('../config/default.config')
    ,{HASH} = require('../tools/user/encryptionString')

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

const codeList = ['signUp', 'signIn', 'reset', 'writeoff']

function Redis() {
    return new Promise(async (res, rej) => {
        try {
            const client = await initRedisJSON()

            //  初始化RedisJSON池
            //  同类的
            for(let codeType of codeList){
                await client.json.set(codeType, '$', {}, {NX: true});
            }
            //  特殊的
            await client.json.set('login', '$', {}, {NX: true});
            //  执行清理程序
            setInterval(async () => {
                clearAllCode(client)
            }, RedisJSON.clearTime)

            //  生成对外程序
            const codeMethods = {}
            for(let codeType of codeList){
                const nowCodeType = codeType.replace(codeType[0],codeType.split("")[0].toUpperCase())
                codeMethods['set' + nowCodeType + 'Code'] = (emailOrUsername, code) => setCode(client, codeType, emailOrUsername, code)
                codeMethods['get' + nowCodeType + 'Code'] = (emailOrUsername) => getCode(client, codeType, emailOrUsername)
                codeMethods['del' + nowCodeType + 'Code'] = (emailOrUsername) => delCode(client, codeType, emailOrUsername)
                // codeMethods['clear' + nowCodeType + 'Code'] = () => clearCode(client, codeType)
            }
            const RJ = {
                client,
                //  uuid和Token
                setLogin: (uuid, token) => setLogin(client, uuid, token),
                getLogin: (uuid) => getLogin(client, uuid),
                delLogin: (uuid, token) => delLogin(client, uuid, token),
                getToken: (token) => getToken(client, token),
                //  'signUp', 'signIn', 'reset' Code
                ...codeMethods
            }
            res(RJ)
        } catch (e) {
            rej(e)
        }
    })
}
//  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$统一清理程序$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
function clearAllCode(client){
    return new Promise(async (res, rej) => {
        //  清理signUpCOde
        try{
            await clearCode(client, 'signUp')
        }catch (e) {
            console.e('清理注册Code发生异常', e)
        }
        //  清理登录Code
        try{
            await clearCode(client, 'signIn')
        }catch (e) {
            console.e('清理登录Code发生异常', e)
        }

        //  清理找回密码Code
        try{
            await clearCode(client, 'reset')
        }catch (e) {
            console.e('清理找回密码Code发生异常', e)
        }
        res()

        //  清理UUID
        try {
            await clearLoginArr(client)
            console.dev('清理UUID成功')
        } catch (e) {
            console.dev('清理UUID发生异常', e)
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
            if(result == null){
                console.e('需要重启服务,Redis被清空，没有根节点。')
                throw new Error('需要重启服务,Redis被清空，没有根节点。')
            }
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
                const result2 = await getLogin(client, uuid)
                if(result2.length == maxClientOnline){
                    await delLoginArr(client, uuid, 0, result[0].token)
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
            const a = await client.del(token)
            if(a != 1){
                rej('删除token指定的UUID失败')
                console.e('删除token指定的UUID失败')
            }else{
                console.dev('删除成功', a)
            }
            res()
        }catch (e) {
            rej(e)
        }
    })
}
//  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>UUID && Token>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//  通用设置Code
function setCode(client, type, emailOrUsername, code){
    return new Promise(async (res, rej) => {
        try{
            const time = new Date().getTime()
            await client.json.set(type, emailOrUsername, {code, time}, {NX:true})
            res()
        }catch (e) {
            rej(e)
        }
    })
}
function getCode(client, type, emailOrUsername){
    return new Promise(async (res, rej) => {
        try{
            const result = await client.json.get(type, {path: emailOrUsername})
            res(result)
        }catch (e) {
            rej(e)
        }
    })
}
function delCode(client, type, emailOrUsername){
    return new Promise(async (res, rej) => {
        try{
            const result = await client.json.del(type, emailOrUsername)
            res(result)
        }catch (e) {
            rej(e)
        }
    })
}
function clearCode(client, type){
    return new Promise(async (res, rej) => {
        try{
            const nowTime = new Date().getTime()
            const result = await client.json.get(type)
            for(let i in result){
                if(nowTime - result[i].time > RedisJSON.timeout){
                    await delResetCode(client, type, i)
                }
            }
            res()
        }catch (e) {
            rej(e)
        }
    })
}


module.exports = Redis