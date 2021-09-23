"use strict";
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3133;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const cors = require("cors");
const axios = require("axios");
app.use(cors());

const forecastDomain = require("./domain/Forecast.js");
const { response } = require("express");

app.get("/", getHome);

app.get("/weather", getWeather);

function getWeather(request, response) {
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
    let apiResponse = axios
      .get(
        `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${latitude}&lon=${longitude}`
      )
      .then((weatherResponse) => {
        let dailyForecast = getForecast(weatherResponse.data);
        response.status(200).send(dailyForecast);
      });
  } catch (error) {
    handleError(
      500,
      "City does not exist in data from weather /GET :: Try a different city name.",
      response
    );
  }
}

function getHome(request, response) {
  response.status(200).send("Proof of life: 33");
}

function handleError(errorCode, errorMessage, response) {
  response.status(errorCode).send(errorMessage);
}

function getForecast(cityData) {
  let forecastArray = [];
  if (!cityData.status === 200) {
    return forecastArray;
  }
  console.log(cityData.data.data);
  cityData.data.forEach((forecast) => {
    let description = "Low of " + forecast.app_min_temp;
    description += ", high of " + forecast.app_max_temp;
    description += " with " + forecast.weather.description.toLowerCase();
    let date = forecast.datetime;
    forecastArray.push(new forecastDomain.Forecast(date, description));
  });
  return forecastArray;
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
