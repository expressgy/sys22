const { createConnectionNull, createConnectionDatabase } = require('../../tools/database/createConnection')
    , config = require('../../config/default.config')
    , Importer = require('mysql-import')

//  创建数据库
function createDatabase(){
    return new Promise(async (rec, rej) => {
        try {
            const result = await createConnectionNull()
            try{
                const SQL = `Create Database If Not Exists ?? Character Set UTF8;`
                const params = config.DATABASE_INIT.database
                result.connect.query(SQL, params,async (err,data) => {
                    if(err){
                        rej({
                            status:false,
                            message:'数据库创建失败。',
                            code:err.code,
                            errno:err.errno,
                            sqlMessage:err.sqlMessage
                        })
                    }else{
                        result.connect.destroy()
                        rec({
                            status:true,
                            message:'数据库创建成功。',
                            // data
                        })
                    }
                })
            }catch (e){
                rej(e)
            }
        }catch (e){
            rej(e)
        }
    })
}

//  创建表，这里使用的是SQL文件导入
function createTables(){
    return new Promise(async (rec, rej) => {
        const importer = new Importer({
            host: config.DATABASE_INIT.host,
            user: config.DATABASE_INIT.user,
            password: config.DATABASE_INIT.password,
            database: config.DATABASE_INIT.database
        });
        importer.import(config.DATABASE_INIT.sqlFile).then(()=>{
            const files_imported = importer.getImported();
            rec({
                status: true,
                message: '数据表创建成功。',
                SQLfile:files_imported
            })
        }).catch(err=>{
            console.error(err);
            rej({
                status: false,
                message: '数据表创建失败。',
                code: err.code,
                errno: err.errno,
                sqlMessage: err.sqlMessage
            })
        });
    })
}


module.exports = {
    createDatabase,
    createTables
}