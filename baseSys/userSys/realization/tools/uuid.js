/**
 * 生成uuid
 * */
const { v4: uuidv4 } = require('uuid');
//  需要去重- 然后转换成字符串

function makeUUID(){
    return uuidv4().split('-').join("")
}

module.exports = makeUUID