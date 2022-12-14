/**
 * 数据操作的方法封装
 * */
const {init, exec, sql, transaction} = require('mysqls')
const config = require("../../config/default.config");

init({
    host: config.DATABASE_INIT.host,
    user: config.DATABASE_INIT.user,
    password: config.DATABASE_INIT.password,
    database: config.DATABASE_INIT.database,
    port: config.DATABASE_INIT.port,
})


function INSERT(table, data) {
    return sql
        .table(table)
        .data(data)
        .insert()
}

function DELETE(table, data) {
    return sql
        .table(table)
        .where(data)
        .delet();
}

function UPDATE(table, data, where) {
    return sql
        .table(table)
        .data(data)
        .where(where)
        .update()
}

function SELECT(table, field, where) {
    return sql
        .table(table)
        .field(field)
        .where(where)
        .select()
}

function ORDER(table, field, where, order){
    return sql
        .table(table)
        .field(field)
        .where(where)
        .order(order)
        .select()
}

function LIMIT(table, field, limit, where){
    return sql
        .table(table)
        .field(field)
        .limit(limit)
        .where(where)
        .select()
}

function COUNT(table,count, where){
    return sql
        .count(count)
        .table(table)
        .where(where)
        .select()
}

const table = {
    userInfo:'user_info',
    userInfoOther:'user_info_other',
    userLogin:'user_login',
    userRole:'user_role',
    userAuthority:'user_authority',
    userRelationRole:'user_relation_role',
    userRelationAuthority:'user_relation_authority'
}

const DB = {
    SQL:{
        exec, sql
    }
}
for(let i in table){
    DB[i] = (() => {
        return {
            INSERT(data){
                const SQL = INSERT(table[i],data)
                console.e(SQL);
            return exec(SQL)
            },
            DELETE(data){
                const SQL = DELETE(table[i],data)
                console.e(SQL);
                return exec(SQL)
            },
            //  批量删除ID关键段
            DELETEINID(data){
                const SQL = `DELETE FROM ${table[i]} WHERE id in (${data})`
                console.e(SQL);
                return exec(SQL)
            },
            UPDATE(data, where){
                const SQL = UPDATE(table[i], data, where)
                console.e(SQL);
                return exec(SQL)
            },
            SELECT(field, where){
                const SQL = SELECT(table[i], field, where)
                console.e(SQL);
                return exec(SQL)
            },
            ORDER(field, where, order){
                const SQL = ORDER(table[i], field, where, order)
                console.e(SQL)
                return exec(SQL)
            },
            LIMIT(field, limit, where){
                const SQL = LIMIT(table[i], field, limit, where)
                console.e(SQL)
                return exec(SQL)
            },
            COUNT(count, where){
                const SQL = COUNT(table[i], count, where)
                console.e(SQL)
                return exec(SQL)
            }
        }
    })()
}

module.exports = DB