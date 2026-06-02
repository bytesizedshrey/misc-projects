// const a = 'world'

// const b = 5

// // console.log(a - b) //wrong one
// console.log(a * b)

/**
 * string,number,boolean,array,tuple,void never
 */

const a : String = "hello sheelo!!"
const b : number = 69
const c : boolean = true

const lund : number[] = [1,2,3]
lund.push(69)

const dick : [number,number,string] = [89,90,'tarzen']
dick.push('hehe')
dick.push(90)

//void
function greet(name : string) : void {
    console.log("hello " + name)
}

function seeoff(name : string) : string {
    return "byebye" + name
}

greet('geet')
seeoff('geet')

console.log(a)
console.log(b)
console.log(lund)
console.log(dick)