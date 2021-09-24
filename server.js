"use strict";
const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3133;

const cors = require("cors");
app.use(cors());


const routes = require("./routes.js");

app.get("/", routes.getHome);

app.get("/weather", routes.getWeather);

app.get("/movies", routes.getMovies);



app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
