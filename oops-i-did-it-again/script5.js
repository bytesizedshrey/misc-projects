//JS -> Single Threaded
//JS -> Synchronous -> One after one in order.
//JS -> Asynchronous -> One after one but not in order.

 //callbacks and problems in callbacks -> callback hell
 //callbacks are functions that are passed as arguments to other functions and are executed after some operation is completed.

 setTimeout(() => {
    console.log("Hello World");
 }, 2000); // Output: Hello World after 2 seconds

 //callback -> passed in a function as an argument and executed after some operation is completed.

 function abcd(fn){
    fn();
 }
abcd(function(){}); // callback function

//transition : callback -> promise -> async/await