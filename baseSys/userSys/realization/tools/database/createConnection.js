/**
 * 创建数据库连接
 * */
const mysql = require("mysql");
const config = require("../../config/default.config");

function createConnectionNull() {
    return new Promise((rec, rej) => {
        const db = mysql.createConnection({
            host: config.DATABASE_INIT.host,
            user: config.DATABASE_INIT.user,
            password: config.DATABASE_INIT.password,
        });
        db.connect(err => {
            if (err) {
                rej({
                    status: false,
                    message: '数据库连接失败。',
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage
                })
            } else {
                rec({
                    status: true,
                    message: '数据库连接成功。',
                    connect: db
                })
            }
        })
    })
}

function createConnectionDatabase() {
    return new Promise((rec, rej) => {
        const db = mysql.createConnection({
            host: config.DATABASE_INIT.host,
            user: config.DATABASE_INIT.user,
            password: config.DATABASE_INIT.password,
            database: config.DATABASE_INIT.database
        });
        db.connect(err => {
            if (err) {
                rej({
                    status: false,
                    message: '数据库连接失败。',
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage
                })
            } else {
                rec({
                    status: true,
                    message: '数据库连接成功。',
                    connect: db
                })
            }
        })
    })
}

module.exports = {
    createConnectionNull,
    createConnectionDatabase
}