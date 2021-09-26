const cache = {
  weather: {},
  movies: {},
};

checkCache = (key, searchQuery) => {
  console.log("here");
  if (cache[key][searchQuery]) {
    return cache[key][searchQuery];
  } else {
    return false;
  }
}

module.exports = { cache, checkCache };