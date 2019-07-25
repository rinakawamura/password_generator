let a = [1, 2, 3, 4, 5]
let b = [2, 4, 6]

b.forEach(element => {
    if (a.indexOf(element) >= 0) {
    a.splice(a.indexOf(element))}
})

console.log(a)