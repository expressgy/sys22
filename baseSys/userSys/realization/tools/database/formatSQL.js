/**
 * 格式化SQL语句
 * */

function formatSQL(tableStruct){
    let field = ''
    for(let i of tableStruct.field){
        field += `${i.name} ${i.type} ${i.attribute.join(' ')} comment "${i.comment}",`
    }
    field = field.slice(0, field.length - 1)
    return `Create Table If Not Exists ${tableStruct.tableName} (${field})comment = "${tableStruct.comment}";`
}

module.exports = formatSQL