const axios = require('axios');
const { response } = require('express');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const forecastDomain = require("./domain/Forecast.js");
const movieDomain = require("./domain/Movie");

async function getMovies(request, response) {
  let movieQuery = request.query.searchQuery;
  if (movieQuery === undefined) {
    handleError(
      500,
      "Missing city from movie /GET :: ensure a city has been selected.",
      response
    );
  }
  try {
    let apiResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&page=1&query=${movieQuery}`
    );
    
    let movieList = getMoviesArray(apiResponse.data.results);
    response.status(200).send(movieList);
  } catch (error) {
    handleError(
      500,
      "Movie /GET unsuccessful. Ensure a city has been provided or try again later.",
      response
    );
  }
}

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
    handleError(
      500,
      "Missing valid city name, longitude, or latitude from weather /GET :: Try a different city name.",
      response
    );
  }
  try {
    let apiResponse = await axios
      .get(
        `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${latitude}&lon=${longitude}`
      )
      .then((weatherResponse) => {
        let dailyForecast = getForecastArray(weatherResponse.data);
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

function getMoviesArray(movieData) {
  let movieArray = [];
  movieData.forEach((movie) => {
     let title = movie.title;
     let overview = movie.overview;
     let average_votes = movie.vote_average;
     let total_votes = movie.vote_count;
     let image_url = movie.poster_path;
     let popularity = movie.popularity;
     let released_on = movie.release_date;
     let currentMovie = new movieDomain.Movie(title, overview, average_votes, total_votes, image_url, popularity, released_on);
     movieArray.push(currentMovie);
   })
  return movieArray;
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

module.exports = { getWeather, getMovies, getHome };
