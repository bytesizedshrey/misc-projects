// // Ques 1: Write a function that fetches weather data for a given city using the OpenWeatherMap API. Handle any errors that may occur during the fetch operation and log an appropriate message to the console.
// // async function getWeather(city) {
// //   try {
// //     let apiKey = "5b39195452ce33cdd9f406e189c13c33";
// //     //fetching the weather data from the API
// //     let raw = await fetch(
// //       `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
// //     );
// //     //checking if the response is ok or not
// //     if (!raw.ok) {
// //       throw new Error("Error fetching weather data");
// //     }
// //   } catch (error) {
// //     console.log("An error occurred:", error.message);
// //   }
// // }

// // getWeather("mumbai");

async function getWeather(city){
    try{
    let apikey = "5b39195452ce33cdd9f406e189c13c33"
    let raw = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`);

    if(!raw.ok){
        throw new Error("Error fetching weather data");
    }
    let real = await raw.json();
    if(real.main.temp < 0){
        console.log(`It is freezing in ${real.main.temp} in ${city}`);
    } else if(real.main.temp > 40){
        console.log(`It is hot in ${real.main.temp} in ${city}`);
    } else {
        console.log(`The weather is moderate in ${real.main.temp} in ${city}`);
    }
    }
    catch(error){
        console.log("An error occurred:", error.message);
    }
}

console.log(getWeather("delhi")); 

