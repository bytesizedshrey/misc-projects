function instaDataFetch(username,cb){
        //logic to handle the response
        setTimeout(() => {
            cb({id : 1, username : 'harsh',age:90})
        }, 20000);
}
instaDataFetch('harsh',function(data){
    console.log(data);
}); // Output: {id : 1, username : 'harsh',age:90} after 2 seconds

//executing the callback function after 4 seconds with the data object as an argument.
function afterDelay(time,cb){
    setTimeout(() => {
        cb();
    }, 10000);
}
afterDelay(4000,function(){
    console.log("Callback function executed after 4 seconds");
});
 
//callback function to fetch user data after 4 seconds
function getUser(username,cb){
    console.log("Fetching user data...");
    setTimeout(() => {
        cb({id:90, usename : "betrayed", age : 22})
    },4500);
}
//executing the callback function after 4 seconds with the data object as an argument.
function getUserPosts(id, cb){
    console.log("Fetching user posts...");
    setTimeout(() => {
        cb(["post1", "post2", "post3"])
    },5000);
}
//callback hell -> nested callbacks -> pyramid of doom
getUser("harsh", function(data){
    console.log("Printing user data...")
    getUserPosts(data.id, function(posts){
        console.log(posts); // Output: ["post1", "post2", "post3"] after 7.9 seconds
    },6000);
})

//question -> fetch user data and then fetch user posts and then fetch user comments on the posts. (callback hell)
function instagaramsedatalao(username,cb){
    settimeout(() => {
        cb({unumber : 56, username : "rishi"});
    },7000)
}
function metasedatalao(username,cb){
    settimeout(() => {
        cb({unumber : 56, username : "rishi"});
    },8000)
}

instagaramsedatalao("rishi", function(data){
    metasedatalao(data.unumber, function(data){
        console.log(data.unumber); // Output: 56 after 15 seconds
    })
})
function sum(a,b){
    console.log(a + b)
}
function calc (a, b, mercedes){
    mercedes(a,b)
}

calc(2,3,sum)