const nodemailer = require('nodemailer'); //引入模块


const reg = /^[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/

const { EMAILCONFIG,SYSTEM_NAME } = require('../config/default.config')

const transporter = nodemailer.createTransport({
    //node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
    host:EMAILCONFIG.HOST,
    // secureConnection:true,
    service: 'qq', //类型qq邮箱
    // port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: EMAILCONFIG.USER, // 发送方的邮箱
        pass:EMAILCONFIG.PASS// smtp 的授权码
    }
    //pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
    //邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码
});



function sendMail(mail, code) {
    console.log(mail, code)
    return new Promise((rec,rej) => {
        // 发送的配置项
        const mailOptions = {
            from: '"TOGY.GC" <togy.gc@qq.com>', // 发送方
            to: mail, //接收者邮箱，多个邮箱用逗号间隔
            subject: `${SYSTEM_NAME}!`, // 标题
            text: 'Hello world?', // 文本内容
            html: `<div style="position: relative;height: 300px;width: 100%">
                <div><h1 style="text-align: center;line-height: 70px">欢迎使用 ${SYSTEM_NAME} </h1><p style="text-align: center">您在某些地方请求了邮箱的验证码，如果不是自己操作请修改账户的密码。</p></div>
                <div style="width: 100%;position:relative;height: 200px;display: flex;align-items: center;justify-content: center">
                    <div style="background: #333333;height: 80px;line-height: 80px;padding: 1em;font-size: 24px;color:#FEFEFE;font-weight: bold;text-align: center">${code}</div>
                </div>
            </div>`, //页面内容
            // attachments: [{//发送文件
            //      filename: 'index.html', //文件名字
            //      path: './index.html' //文件路径
            //  },
            //  {
            //      filename: 'sendEmail.js', //文件名字
            //      content: 'sendEmail.js' //文件路径
            //  }
            // ]
        };
        //发送函数
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej(error,info)
            } else {
                rec(info) //因为是异步 所有需要回调函数通知成功结果
            }
        });
    })
}

function checkEmail(email){
    return reg.test(email)
}
module.exports = {
    sendMail,
    checkEmail
}