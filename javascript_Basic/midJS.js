const person = {
    name : 'Charles',
    course : 'FrontEndExpert'
};

console.log(person);
console.log(person.name);

//Json
console.log(typeof JSON.parse(JSON.stringify(person))); 

//map -> similar to standard object. Difference is that map has some functions for getting and setting values.
const map = new Map();
map.set(123,'hello')
map.set(456,'world')
console.log(map.get(123))
console.log(map.get(456))
console.log(map.get(0)) //dosent exist -> undefined
console.log(map.size)

//Set
const set = new Set();
set.add('hello');
set.add('hello')
set.delete('hello');
set.add('world');
console.log(set.has('world'))
console.log(set.size)

//Array
const arr = [1,2,3]
console.log(arr)

//Function

function additionThree(num){
    const a = 4
    return num + a
}

console.log(additionThree(3))

//for loop
console.log('For loop')
for (let i = 0; i < 4; i++){
    console.log(i)
    if(i===2){
        break;
    }
}
//while loop
console.log('while loop')
let i = 0;
while(i<4){
    console.log(i);
    i++;
}
//Do-while loop
console.log('Do-while loop')
let j = 0;
do{
    console.log(i);
    i++
}while(i < 0)

const obj = {
    name : ': ' + 'Techburner',
    course : ': ' +'Brio.io'
};

for(const key in obj){
    console.log(key,obj[key]);
}

 
//conditions

const condition = true;

if (condition){
    console.log('It was true');
} else if (condition == false){
    console.log('It was false');
}
else {
    console.log('Default');
}

console.table([[1,2], ['hello', 'world']])
