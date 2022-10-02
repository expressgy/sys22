module.exports = {
    //  配置文件路径
    CONFIG_PATH:__dirname,
    SYSTEM_NAME:'ANTO-G',
    PROJECT_NAME:'sys22 userSys',
    PORT:'3000',
    KEY:'expressgy',
    DATABASE_INIT:{
        host: 'localhost',
        user: 'root',
        password:'Hxl1314521',
        database: "sys22_user",
        port: 3306,
        sqlFile:__dirname + "/database/sys22_user.sql"
    },
    //  加密
    encryption:{
        salt:'время,вперёд!',// 盐
        secretKey:"быть всегда готовым!",// 密钥
    },
    //  用户系统
    user:{
        //  注册
        sign:{
            mailVerf: false,//  邮箱验证注册
            phoneVerf:false,//  手机验证注册
            length:4,
        },
        //  登录
        login:{
            timeLimit:1000 * 60 * 60 * 24 * 14 ,//  token时常
        }
    },
    //  邮件服务
    EMAILCONFIG : {
        HOST:'smtp.qq.com',
        USER:'togy.gc@qq.com',
        PASS:'qnpjbbeyunysdhac'
    }
}