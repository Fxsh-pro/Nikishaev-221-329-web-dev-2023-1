// function fibb(n) {
//     if (n <= 1) {
//         return n;
//     }
//     return fibb(n - 1) + fibb(n - 2);
// }
// fibb(10); // Рекурсивный метод

function fibb(n) {
    if (n <= 1) {
        return n;
    }
    let a = 0;
    let b = 1;
    let temp;
    for (let i = 2; i <= n; i++) {
        temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

console.log(fibb(15))






