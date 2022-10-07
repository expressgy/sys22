/**
 * 数据操作的方法封装
 * */
const {init, exec, sql, transaction} = require('mysqls')
const config = require("../config/default.config");

init({
    host: config.DATABASE_INIT.host,
    user: config.DATABASE_INIT.user,
    password: config.DATABASE_INIT.password,
    database: config.DATABASE_INIT.database,
    port: config.DATABASE_INIT.port,
})


let sqlstring = sql.field('authority_id').table('user_relation_authority').where({role_id:4}).select()
let SQQ = sql.query(`SELECT * from user_authority where id in (${sqlstring})`)
console.log(SQQ)
exec(SQQ).then(res => {
    console.log(res)
})