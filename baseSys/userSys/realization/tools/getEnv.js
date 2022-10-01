/**
 * 环境探测
 * */

const os = require('os')

//  获取系统信息
function getSystem(){
    return {
        hostname:os.hostname(),
        os:os.type() + os.arch()
    }
}

module.exports = {
    getSystem
}