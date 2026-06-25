//taking username and a callback function as arguments
function loginUser(username, cb){
    console.log("Logging in user...");
    setTimeout(() => {
        cb({id : 1, username : 'harsh',age:90});
    },5000);
}
//executing the callback function after 5 seconds with the data object as an argument.
function fetchPermission(id,cb){
    console.log("Fetching user permissions...");
    setTimeout(() => {
        cb(["read", "write", "delete"]);
    },6000);
}
//executing the callback function after 6 seconds with the permissions array as an argument.
function loadDashboard(permission,cb){
    console.log("Loading dashboard...");
    setTimeout(() => {
        cb();
    },7000);
}
//callback hell -> nested callbacks -> pyramid of doom
loginUser('bytesizedshrey', function(userdata){
    fetchPermission(userdata.id, function(permissions){
        loadDashboard(permissions, function(){
            console.log("Dashboard loaded successfully");
        }); 
    })
});
