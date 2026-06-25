//bulk email sending simulation with parallel promises and error handling
let usrEmails = ["user1@example.com", "user2@example.com", "user3@example.com"];

function sendEmails(email){
    return new Promise((resolve, reject) => {

        let time = Math.floor(Math.random() * 5); // random time between 0 to 4 seconds

        setTimeout(() => {
            let probability = Math.floor(Math.random() * 10); // random number between 0 to 9
            if(probability <= 5) resolve(`Email sent to ${email} in ${time} seconds`);
            else reject(`Failed to send email to ${email} in ${time} seconds`);
        }, time*1000); 
    });
} 

sendEmails("sneha@gmail.com")
.then(function(data){
    console.log(data)
})
.catch(function(error){
    console.log(error)
})

