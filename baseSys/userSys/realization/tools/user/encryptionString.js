/**
 * 加密
 * */
const crypto = require('crypto');

/**
 * 配置文件
 * */
const CFG = global.cfg ? global.cfg.encryption : require('../../../config/default.config')
/**
 * 加密算法
 * */

//  不可逆加密
const MD5 = "md5"   //  32位
    , SHA256 = 'sha256' //  64位
    , SHA512 = 'sha512' //  128位
//  可逆加密
const AES128 = 'aes-128-cbc'
    , AES256 = 'aes-256-gcm'

//  vi
// ase-128-cbc 加密算法要求key和iv长度都为16
// const key = Buffer.from('9vApxLk5G3PAsJrM', 'utf8');
// const iv = Buffer.from('FnJL7EDzjqWjcaY9', 'utf8');

// const key = crypto.randomBytes(32); // 256 位的共享密钥
// const iv = crypto.randomBytes(16); // 初始向量，16 字节
const key = Buffer.from(HASH(CFG.encryption.secretKey, MD5).slice(0, 16), 'utf8');
const iv = Buffer.from(HASH(CFG.encryption.salt, MD5).slice(0, 16), 'utf8');

/**
 * 不可逆加密
 * */
function HASH(plaintext, algorithm = SHA512) {
    const sha512 = crypto.createHash(algorithm)
    const sha512Sum = sha512.update(plaintext + CFG.encryption.salt)
    const ciphertext = sha512Sum.digest('hex')
    return ciphertext
}

/**
 * 可逆加密
 * */
// 加密

// 加密
function encrypt(plaintext, algorithm = AES128) {
    const cipher = crypto.createCipheriv(algorithm, key, iv); // 初始化加密算法
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    // return {
    //     ciphertext,
    //     tag : cipher.getAuthTag()
    // };
    return ciphertext
}

// 解密
function decrypt(ciphertext, algorithm = AES128) {
    let plaintext = '';
    const cipher = crypto.createDecipheriv(algorithm, key, iv);
    plaintext += cipher.update(ciphertext, 'hex', 'utf8');
    plaintext += cipher.final('utf8');
    return plaintext;
}

// const a = 'i love u!'
// const b = encrypt(a)
// const c = decrypt(b)
// console.log(a, b, c);
// aes128()
// aes256()

function aes256(){
    'use strict';

    const crypto = require('crypto');

// 初始化参数
    const text = 'Encryption Testing AES GCM mode'; // 要加密和解密的数据
    const key = crypto.randomBytes(32); // 256 位的共享密钥
    const iv = crypto.randomBytes(16); // 初始向量，16 字节
    const algorithm = 'aes-256-gcm'; // 加密算法和操作模式

// 加密
    const cipher = crypto.createCipheriv(algorithm, key, iv); // 初始化加密算法
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag(); // 生成标签，用于验证密文的来源

// 解密
    const decipher = crypto.createDecipheriv(algorithm, key, iv); // 初始化解密算法
    decipher.setAuthTag(tag); // 传入验证标签，验证密文的来源
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    console.log(decrypted); // Encryption Testing AES GCM mode

}
function aes128(){
// 加密
    function genSign(src, key, iv) {
        let sign = '';
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        sign += cipher.update(src, 'utf8', 'hex');
        sign += cipher.final('hex');
        return sign;
    }

// 解密
    function deSign(sign, key, iv) {
        let src = '';
        const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        src += cipher.update(sign, 'hex', 'utf8');
        src += cipher.final('utf8');
        return src;
    }

    // ase-128-cbc 加密算法要求key和iv长度都为16
    const key = Buffer.from('9vApxLk5G3PAsJrM', 'utf8');
    const iv = Buffer.from('FnJL7EDzjqWjcaY9', 'utf8');
    const sign = genSign('hello world', key, iv);
    console.log(sign); // 764a669609b0c9b041faeec0d572fd7a


// 解密
    const src=deSign('764a669609b0c9b041faeec0d572fd7a', key, iv);
    console.log(src); // hello world
}

module.exports = {
    HASH,
    encrypt,
    decrypt
}