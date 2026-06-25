//creating a class named mercedes
class mercedes {
    //constructor function to initialize the properties of the class
    constructor(model, year) {
        this.model = model;
        this.year = year;
    }
    //method to start the car
    start() {
        console.log(`${this.model} is starting...`);
    }
    //method to stop the car
    stop() {
        console.log(`${this.model} is stopping...`);
    }
}
//creating an object of the class mercedes
var mercedes_benz = new mercedes("Mercedes-Benz S-Class", 2021);
mercedes_benz.start();
//creating another object of the class mercedes
let newMercedes = new mercedes("Mercedes-Benz E-Class", 2022);
newMercedes.start();