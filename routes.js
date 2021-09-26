const axios = require('axios');
const { response } = require('express');
const weather = require('./weather');
const movies = require('./movies');

function getHome(request, response) {
  response.status(200).send("Proof of life: 33");
}

function getWeather(request, response) {
  weather.getWeather(request, response);
}

function getMovies(request, response) {
  movies.getMovies(request, response);
}

module.exports = { getHome, getWeather, getMovies };
