

//import API key 
import{
    apiKey
} from './config.js';

//Global variables
var mainEl = $('#main-area');  //for displayingweather
var cityEl = $('#searchCity'); //user input
var searchBtnEl = $('#searchButton');
var savedSearchEl = $('#savedSearch');//area to display list of previous searches
var todayEl = $('#today');
var curCity = "";
var savedCities = []; //for saving in local storage
var coords = {     //to store latitute and longitude
    lat: 0.0000,
    lon: 0.0000
}
//variables to create lines in weather display
var line1 = "";
var line2 = "";
var line3 = "";
var line4 = "";
var icon = "";



// Wrapper jQuery function to ensure that  the code isn't run until the browser has 
// finished rendering all the elements in the html.
$(function () {

    //Cleanup old city current weather and forecast
    function removeOldWeatherForecast() {

        for (var x = 0; x < 6; x++) {
            var line = $('#line1' + x);

            if (line !== null)
                line.remove();
            line = $('#line2' + x)
            if (line !== null)
                line.remove();
            line = $('#line3' + x)
            if (line !== null)
                line.remove();
            line = $('#line4' + x)
            if (line !== null)
                line.remove();
            line = $('#icon' + x)
            if (line !== null)
                line.remove();
        }

    }

    //this function is trying to find a time slot in data returned from weather API to closest to the current time of the 
    //weather API returns data for every 3 hour.
    //You will see that if you search for east coast cities, the current weather will show current weather 
    //but the forecast will be of the time slot of the user.

    function getTimetoUseInAPI() {

        var currTime = dayjs().format('HH:mm:ss');
        var useTime = "";

        if (currTime < "03:00:00")
            useTime = "00:00:00";
        else if (currTime < "06:00:00")
            useTime = "03:00:00";
        else if (currTime < "09:00:00")
            useTime = "06:00:00";
        else if (currTime < "12:00:00")
            useTime = "09:00:00";
        else if (currTime < "15:00:00")
            useTime = "12:00:00";
        else if (currTime < "18:00:00")
            useTime = "15:00:00";
        else if (currTime < "21:00:00")
            useTime = "18:00:00";
        else
            useTime = "03:00:00";

        return useTime;
    }


    //save the current city search in local storage
    function saveCity(city) {
        //add the latest city searched to the savedCities
        
        city = city.trim();
        savedCities[savedCities.length] = city;


        //write savedCities to local storage
        localStorage.setItem("savedCities", JSON.stringify(savedCities));

        //display in saved search area
        if (curCity !== city) {

            //return for first iteration
            if (curCity === "") {
                curCity = city;
                return;
            }

            //form next iteration,save the last searched city in the search list
            var btn = $('<button>');

            btn.attr('class', 'p-2 m-2 rounded-pill w-100 border-0');
            btn.text(curCity);

            savedSearchEl.append(btn);
            curCity = city;
        }
    }

    //Get weather of a city
    function getCityWeather(city, save) {
        removeOldWeatherForecast();
        
        
        //saveCity in local Storage if new new search
        if (save) {
            saveCity(city);
        }

        //use openweathermap GeoCoding API to get latitute, longitude of a city to be used in weather APIS
        var geoCordURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey;;

        fetch(geoCordURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) { //data returned from fetch call with geoCordURL

                //**TO_DO**: get coordinates from the data returned by geocoding API
                if(data && data.length > 0) {
                    coords.lat = data[0].lat;
                    coords.lon = data[0].lon;
                

                //**TO_DO**:  Make another fetch call to the openweathermap API with coordinates to get current day forecast
                    var currentWeatherRequestUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + coords.lat + '&lon=' + coords.lon + '&units=imperial&appid=' + apiKey;

                    fetch(currentWeatherRequestUrl)
                     .then(function(response) {
            
                        return response.json();
                    })
                    .then(function(weatherData) {
                        
                        var cityNameEl = $('#cityName');
                        cityNameEl.text(city + " (" + dayjs().format('MM/DD/YYYY') + ")");

                        // Updating the weather details with actual values
                        var temperatureEl = $('#temperature');
                        var humidityEl = $('#humidity');
                        var windEl = $('#wind');

                        temperatureEl.text("Temperature: " + weatherData.main.temp + "°F");
                        humidityEl.text("Humidity: " + weatherData.main.humidity + "%");
                        windEl.text("Wind: " + weatherData.wind.speed + " MPH");

                    })
                    .catch(function(error) {
                        console.log("error fetching data", error);
                    });
                //call the openweathermap API with coordinates to get 5 day forecast
                var forecastRequestUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + coords.lat + '&lon=' + coords.lon + '&cnt=40&units=imperial&appid=' + apiKey;

                    fetch(forecastRequestUrl)
                     .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {

                        var currDate = dayjs().format("YYYY-MM-DD");
                        var useTime = getTimetoUseInAPI();
                        //console.log(data);

                        //we will use this loop 5 times to display 5 day forecase
                        for (var x = 1; x < 6; x++) {
                            var useDate = dayjs().add(x, 'day').format("YYYY-MM-DD");

                            var useDateTime = useDate + " " + useTime;

                            var i = 0;
                            //this loop will find the correct entry in list array of data based on current time of the user location
                            while (i < data.list.length) {
                                if (useDateTime === data.list[i].dt_txt) {
                                    var dayEl = $('#day' + x);

                                    //add forecast weather to "forecast" section
                                    line1 = $('<p>');
                                    line1.attr('class', 'fw-bolder fs-5 p-2');
                                    line1.attr('id', 'line1' + x);
                                    line1.text(dayjs().add(x, 'day').format('MM/DD/YYYY'));
                                    dayEl.append(line1);

                                    icon = $('<img>');
                                    icon.attr('src', 'https://openweathermap.org/img/wn/' + data.list[i].weather[0].icon + '.png');
                                    icon.attr('id', 'icon' + x);
                                    dayEl.append(icon);

                                    line2 = $('<p>');
                                    line2.addClass('p-2 fs-6');
                                    line2.attr('id', 'line2' + x);
                                    line2.text("Temp: " + data.list[i].main.temp_max + "\u00B0F");
                                    dayEl.append(line2);

                                    line3 = $('<p>');
                                    line3.addClass('p-2 fs-6');
                                    line3.attr('id', 'line3' + x);
                                    line3.text("Wind: " + data.list[i].wind.speed + " MPH");
                                    dayEl.append(line3);

                                    line4 = $('<p>');
                                    line4.addClass('p-2 fs-6');
                                    line4.attr('id', 'line4' + x);
                                    line4.text("Humidity: " + data.list[i].main.humidity + " %");
                                    dayEl.append(line4);

                                    break;
                                }
                                i++;
                            }
                        }

                    });
                }
            });



    }

    //Display the weather of last city searched whent he program starts
    function getLastSearchWeather() {

        var lastCity = "";

        //If no saved local storage, use browser location to get a city to display
        if (savedCities.length === 0) {
            lastCity = "San Francisco";
            savedCities[savedCities.length] = lastCity;
            //write savedCities to local storage
            localStorage.setItem("savedCities", JSON.stringify(savedCities));
            curCity = lastCity;
        } else
            lastCity = savedCities[savedCities.length - 1];

        cityEl.val(lastCity);

        getCityWeather(lastCity, false);

    }


    // Display all saved Cities in grey pill box buttons under Searchform on the sidebar
    function displaySavedCities() {

        for (var i = 0; i < savedCities.length; i++) {
            var btn = $('<button>');

            btn.attr('class', 'p-2 m-2 rounded-pill w-100 border-0');
            // btn.attr('id', 'savedCity');
            btn.text(savedCities[i]);

            savedSearchEl.append(btn);
        }
        return;
    }

    // Get all cities stored in local storage savedCities array
    function getStoredCities() {
        var storedList = JSON.parse(localStorage.getItem("savedCities"));
        if (storedList !== null) {
            savedCities = storedList;
        }
        return;
    }

    searchBtnEl.on('click', function (event) {
        event.preventDefault();
       
        getCityWeather(cityEl.val().trim(), true);
    });

    document.addEventListener('click', function (event) {
        var el = event.target;

        event.preventDefault();

        if (el.matches('button') && (el.innerHTML !== 'Search')) {
            
            cityEl.val(el.innerHTML);
            getCityWeather(cityEl.val().trim(), false);
        }
    });

    //initialiation function
    function init() {
        getStoredCities();

        displaySavedCities();

        getLastSearchWeather();
    }
    
    init();

});
