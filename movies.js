const errors = require("./error");
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const movieDomain = require("./domain/Movie");
const axios = require("axios");
const { response } = require("express");
const cache = require("./cache");
require("dotenv").config();

async function getMovies(request, response) {
  let movieQuery = request.query.searchQuery;
  if (cache.checkCache("movies", movieQuery)) {
    let cachedMovies = cache.cache.movies[movieQuery];
    // milliseconds/sec * sec/min * min/day * day/week -- as movies are typically released once a week
    if (Date.now() - cachedMovies.timestamp < 1000 * 60 * 60 * 24 * 7) {
      response.status(200).send(cachedMovies);
      return;
    }
  }
  if (movieQuery === undefined) {
    errors.handleError(
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
    let movieObject = {
      data: movieList,
      timestamp: Date.now(),
    }
    cache.cache.movies[movieQuery] = movieObject;
    response.status(200).send(movieObject);
  } catch (error) {
    errors.handleError(
      500,
      "Movie /GET unsuccessful. Ensure a city has been provided or try again later.",
      response
    );
  }
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
    let currentMovie = new movieDomain.Movie(
      title,
      overview,
      average_votes,
      total_votes,
      image_url,
      popularity,
      released_on
    );
    movieArray.push(currentMovie);
  });
  return movieArray;
}

module.exports = { getMovies };
