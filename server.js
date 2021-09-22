"use strict";
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const weatherData = require("./data/weather.json");
const cors = require("cors");
app.use(cors());

const forecastDomain = require("./domain/Forecast.js");
const { response } = require("express");

app.get("/", (request, response) => {
  response.status(200).send("Test");
});

app.get("/weather", (request, response) => {
  let cityQuery = request.query.searchQuery;
  if (cityQuery) {
    cityQuery = cityQuery.toLowerCase();
  }
  let latitude = request.query.lat;
  let longitude = request.query.lon;
  if (
    cityQuery === undefined ||
    latitude === undefined ||
    longitude === undefined
  ) {
    handleError(
      500,
      "Missing valid city name, longitude, or latitude from weather /GET :: Try a different city name.",
      response
    );
  }
  try {
    const cityData = weatherData.find(
      (city) =>
        city.city_name.toLowerCase() === cityQuery &&
        city.lon === longitude &&
        city.lat === latitude
    );
    let dailyForecast = getForecast(cityData);
    response.status(200).send(dailyForecast);
  } catch (error) {
    handleError(
      500,
      "City does not exist in data from weather /GET :: Try a different city name.",
      response
    );
  }
});

function handleError(errorCode, errorMessage, response) {
  response.status(errorCode).send(errorMessage);
}

function getForecast(cityData) {
  let forecastArray = [];
  cityData.data.forEach((forecast) => {
    let description = "Low of " + forecast.app_min_temp;
    description += ", high of " + forecast.app_max_temp;
    description += " with " + forecast.weather.description.toLowerCase();
    let date = forecast.valid_date;
    forecastArray.push(new forecastDomain.Forecast(date, description));
  });
  return forecastArray;
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
