//class expression
let animal = class {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
}
let dog = new animal("Buddy", "Dog");
console.log(dog.name); // Output: Buddy
console.log(dog.species); // Output: Dog
//hoisting does not work with class expressions

//inheritance -> it is a mechanism in which one class can inherit
//properties and methods from another class. it is used to achieve code reusability and to create a hierarchical relationship between classes.
class Animal{
    constructor(name,species){
        this.name = name;
        this.species = species;         
    }
    eat(){
        console.log(`${this.name} is eating...`);
    }
    breath(){
        console.log(`${this.name} is breathing...`);
    }
}

//inheriting the properties and methods of the class Animal to the class crab
//extends keyword is used to inherit the properties and methods of the class Animal to the class crab
class crab extends Animal{
    constructor(){
        this.hands = 0;
        this.legs = 8;
}
    drinkWater(){
        console.log(`${this.name} is drinking water...`);      
    }  
}
// let myCrab = new crab("Crabby", "Crab");

//private properties
class hello{
    constructor(){
        this._age = 22; //private property
    }
    //gatekeeper method to set the value of the private property.Setter gatekeeper hai. Ye decide karta hai kaunsi value allowed hai.
    set age(value){
        if(value < 0){
            console.log("Age cannot be negative");
            return;
        }else{
            this._age = value;
            return this._age;
        }
    }
    //Getter classy waiter hai — jab koi value maange, woh properly serve karta hai.Matlab: “You’ll get the value, but only how I decide.”
    get age(){
        return this._age;
    }
}
//Getter & Setter = data ko access karne ka controlled, classy aur safe way.

let GG = new hello();
GG._age = 25; // trying to set the age property to 25
console.log(GG._age); // Output: 22