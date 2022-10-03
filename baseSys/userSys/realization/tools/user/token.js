/**
 * 生成和验证jwt
 * */
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('./encryptionString')

// authorization
// Token.decrypt(ctx.header.authorization);   //    获取其中的令牌

const CFG = global.cfg ? global.cfg.encryption : require('../../config/default.config')

module.exports = {
    //  加密
    encrypt: (token, time = CFG.user.login.timeLimit) => {
        //  需要设置超时时间
        return encrypt(jwt.sign(token, CFG.encryption.secretKey, {expiresIn: time / 1000}))
    },
    //  解密
    decrypt: (token) => {
        try {
            token = decrypt(token)
            let data = jwt.verify(token, CFG.encryption.secretKey);
            return {
                token:true,
                id:data
            };
        } catch (e) {
            return {
                token:false,
                data:e
            }
        }
    }
}