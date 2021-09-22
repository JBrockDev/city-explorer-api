'use strict';
const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
const weatherData = require('./data/weather.json');
const cors = require('cors');
app.use(cors());

const Forecast = require('./domain/Forecast');

app.get('/', (request, response) => {
  response.status(200).send("Test");
});

app.get('/weather', (request, response) => {
  let cityQuery = request.query.searchQuery;
  if (cityQuery) {
    cityQuery = cityQuery.toLowerCase();
  }
  let latitude = request.query.lat;
  let longitude = request.query.lon;
  if (!cityQuery || !latitude || !longitude) {
    response.status(300).send("Sorry, you did not supply all needed parameters.");
  }
  const cityData = weatherData.find(city => 
    city.city_name.toLowerCase() === cityQuery &&
    city.lon === longitude &&
    city.lat === latitude);
  
  let dailyForecast = getForecast(cityData);
  response.status(200).send(dailyForecast);
});

function getForecast(cityData) {
  let forecastArray = [];
  cityData.data.forEach(forecast => {
    let description = "Low of " + forecast.app_min_temp;
    description += ", high of " + forecast.app_max_temp;
    description += " with " + forecast.weather.description.toLowerCase();
    let date = forecast.valid_date;
    forecastArray.push([description, date]);
  });
  return forecastArray;
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));