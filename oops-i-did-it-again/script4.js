let usr1 = {
    name : "Shreyash",
    email : "byte@gmail.com",
    loggin : function(){
        console.log(`${this.name} is logged in with email ${this.email}`);
    }
}
usr1.loggin(); // Output: Shreyash is logged in with email

class user {
    constructor(firstName, emailID){
        this.firstName = firstName;
        this.email = emailID;
    }
    loggin(){
        console.log(`${this.firstName} is logged in with email ${this.email}`);
    }
} 

let user1 = new user("Rohit", "rohit@gmail.com");
let user2 = new user("Virat", "virat@gmail.com");
user1.loggin(); // Output: Rohit  is logged in with email
user2.loggin(); // Output: Virat is logged in with email

class product{
    constructor(name,price){
        this.name = name;
        this.price = price;
    }
    finalPrice(){
        let mrp = this.price;
        let discount = this.price * 0.1; // 10% discount
        let finalPrice = mrp - discount;
        console.log(`The final price of ${this.name} is ${finalPrice}`);
    }
}
let zara = new product('red dress', 1000);
zara.finalPrice(); // Output: The final price of red dress is 900

class car{
    constructor(brand, model){
        this.brand = brand;
        this.model = model;
    }
    carDetails(){
        console.log(`The name of the car is ${this.brand} and the model is ${this.model}`);
    }
}
let bmw = new car("BMW", "M4 Competition");
let mercedes = new car("Mercedes-Benz", "E-Class");
bmw.carDetails(); // Output: The name of the car is BMW and the model is M4 Competition
mercedes.carDetails(); // Output: The name of the car is Mercedes-Benz and the model is E-Class

class student{
    constructor(name , rollNo){
        this.name = name;
        this.rollNo = rollNo;
    }
    studentDetails(){
        console.log(`The name of the student is ${this.name} and the roll number is ${this.rollNo}`);
    }
}

let s1 = new student('virat', 18);
let s2 = new student('rohit', 45);
let s3 = new student('Dhoni', 7);
s1.studentDetails(); // Output: The name of the student is virat and the roll number is 18
s2.studentDetails(); // Output: The name of the student is rohit and the roll number is 45
s3.studentDetails(); // Output: The name of the student is Dhoni and the roll number is 7   

let obj = {
    sayName : function(){
        console.log(this)
    },
    sayArrowName : () =>{
        console.log(this)
    }
}

obj.sayArrowName(); // Output: Window object
obj.sayName(); // Output: obj object