
console.time(0)
var timestamp = timestamp=new Date()
console.timeEnd(0)


console.time(1)
var timestamp1 = timestamp.valueOf();
console.timeEnd(1)

console.time(2)
var timestamp2 = timestamp.getTime();
console.timeEnd(2)