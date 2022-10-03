const token = require('../tools/user/token')

const a = token.encrypt({user:'xsxsxs'}, 3)

console.log(a)

setTimeout(() => {
    const b = token.decrypt(a)

    console.log(b)
},2000)
