//error handling
//syntax error > it occurs when there is a mistake in the syntax of the code. it is detected by the compiler or interpreter. it is a compile-time error. it can be fixed by correcting the syntax of the code.
// eg > lrt a = 12;

//runtime error > it occurs when there is an error in the logic of the code. it is detected during the execution of the code. it is a runtime error. it can be fixed by correcting the logic of the code.
//eg >function abcd(){
//     let a = 12;
//     console.log(a.name.fist); // runtime error -> cannot read property 'first' of undefined 
// }

//logical error > it occurs when there is an error in the logic of the code. it is detected during the execution of the code. it is a logical error. it can be fixed by correcting the logic of the code.
//eg > function abcd(){
//     let a = 12;
//     let b = 0;
//     console.log(a/b); // logical error -> division by zero is not defined
// }

// try{
//     //code that may throw an error
//     let a = 12;
//     console.log(a.name.first); // runtime error -> cannot read property 'first' of undefined 
// }
// catch(errorhehe){
//     //code to handle the error
//     console.log("An error occurred: " + errorhehe.message + " at line number " + errorhehe.lineNumber);
// }
// console.log("This will be executed even if there is an error in the try block");

//try catch finally
try{
    //code that may throw an error
    let a = 12;
    console.log(a.name.first); // runtime error -> cannot read property 'first' of undefined 
}
catch(errorhehe){
    //code to handle the error
    console.log("An error occurred: " + errorhehe.message + " at line number " + errorhehe.lineNumber);
}
finally{
    //code that will be executed regardless of whether an error occurred or not
    console.log("This will be executed regardless of whether an error occurred or not");
}
// throw new Error() = create a custom error and stop the program until it’s handled.
function buyMercedes(balance) {
  if (balance < 5000000) {
    throw new Error("Insufficient balance to buy Mercedes");
  }
  console.log("Mercedes purchased");
}
buyMercedes(100000); // Output: Uncaught Error: Insufficient balance to buy Mercedes