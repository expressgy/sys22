const styles = {
    // style:    [ style code, reset code  ]
    'bold'          : ['\x1B[1m',  '\x1B[22m'],
    'italic'        : ['\x1B[3m',  '\x1B[23m'],
    'underline'     : ['\x1B[4m',  '\x1B[24m'],
    'inverse'       : ['\x1B[7m',  '\x1B[27m'],
    'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
    'white'         : ['\x1B[37m', '\x1B[39m'],
    'grey'          : ['\x1B[90m', '\x1B[39m'],
    'black'         : ['\x1B[30m', '\x1B[39m'],
    'blue'          : ['\x1B[34m', '\x1B[39m'],
    'cyan'          : ['\x1B[36m', '\x1B[39m'],
    'green'         : ['\x1B[32m', '\x1B[39m'],
    'magenta'       : ['\x1B[35m', '\x1B[39m'],
    'red'           : ['\x1B[31m', '\x1B[39m'],
    'yellow'        : ['\x1B[33m', '\x1B[39m'],
    'whiteBG'       : ['\x1B[47m', '\x1B[49m'],
    'greyBG'        : ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG'       : ['\x1B[40m', '\x1B[49m'],
    'blueBG'        : ['\x1B[44m', '\x1B[49m'],
    'cyanBG'        : ['\x1B[46m', '\x1B[49m'],
    'greenBG'       : ['\x1B[42m', '\x1B[49m'],
    'magentaBG'     : ['\x1B[45m', '\x1B[49m'],
    'redBG'         : ['\x1B[41m', '\x1B[49m'],
    'yellowBG'      : ['\x1B[43m', '\x1B[49m']
};
function initConsole() {
    //  斜体
    console.__proto__.i = function () {
        console.log(`\x1B[3m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  粗体
    console.__proto__.b = function () {
        console.log(`\x1B[1m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  下划线
    console.__proto__.u = function () {
        console.log(`\x1B[4m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  错误
    console.__proto__.e = console.__proto__.err = function () {
        console.error(`\x1B[31m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  成功
    console.__proto__.s = console.__proto__.success = function () {
        console.log(`\x1B[32m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  警告
    console.__proto__.w = console.__proto__.warning =  function () {
        console.warn(`\x1B[33m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  一般提示
    console.__proto__.i = console.__proto__.info =  function () {
        console.log(`\x1B[34m${Array.from(arguments).join(',')}\x1B[0m`)
    }
    //  青色
    console.__proto__.a = function () {
        console.log(`\x1B[36m${Array.from(arguments).join(',')}\x1B[0m`)
    }

    //  dev
    console.__proto__.dev = console.log

    for(let i in styles){
        console.__proto__[i] = function (){
            console.log(`${styles[i][0]}${Array.from(arguments).join(',')}${styles[i][1]}`)
        }
    }
}
module.exports = initConsole
