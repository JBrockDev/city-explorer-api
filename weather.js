let errors = require('./error');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const forecastDomain = require("./domain/Forecast.js");
const axios = require('axios');
const { response } = require('express');
const cache = require('./cache');
require("dotenv").config();

async function getWeather(request, response) {
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
    errors.handleError(
      500,
      "Missing valid city name, longitude, or latitude from weather /GET :: Try a different city name.",
      response
    );
  }
  try {
    if (cache.checkCache("weather", cityQuery)) {
      let cachedWeather = cache.cache.weather[cityQuery];
      if (Date.now() - cachedWeather.timestamp < 1000 * 60 * 60) {
        response.status(200).send(cachedWeather);
        return;
      }
    }
    let apiResponse = await axios
      .get(
        `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${latitude}&lon=${longitude}`
      )
      .then((weatherResponse) => {
        let dailyForecast = getForecastArray(weatherResponse.data);
        let weatherObject = {
          data: dailyForecast,
          timestamp: Date.now(),
        }
        cache.cache.weather[cityQuery] = weatherObject;
        response.status(200).send(weatherObject);
      });
  } catch (error) {
    console.log(error);
    errors.handleError(
      500,
      "City does not exist in data from weather /GET :: Try a different city name.",
      response
    );
  }
}

function getForecastArray(cityData) {
  let forecastArray = [];
  if (!cityData.status === 200) {
    return forecastArray;
  }
  cityData.data.forEach((forecast) => {
    let description = "Low of " + forecast.app_min_temp;
    description += ", high of " + forecast.app_max_temp;
    description += " with " + forecast.weather.description.toLowerCase();
    let date = forecast.datetime;
    forecastArray.push(new forecastDomain.Forecast(date, description));
  });
  return forecastArray;
}

module.exports = { getWeather };