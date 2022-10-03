function getStr(len, size='big'){
    if(size == 'big'){
        return Math.random().toString(36).slice(-len).toString().toUpperCase();
    }else{
        return Math.random().toString(36).slice(-len).toString().toLowerCase();
    }

}

module.exports = getStr