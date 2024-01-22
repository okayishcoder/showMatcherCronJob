const axios = require("axios");
const mongoose = require("mongoose");

const Show = require("./model/show");
const genreList = require("./static/genres");

const getConnection = async () => {
  await mongoose
    .connect(
      "mongodb+srv://yash:moviematcher@cluster0.tgigafd.mongodb.net/movie_matcher?retryWrites=true&w=majority"
    )
    .then((result) => {
      console.log("Connected!!!");
      //console.log(result);
    })
    .catch((err) => {
      console.log("Connection failed with error:");
      console.log(err);
      throw err;
    });
};

getConnection();

const options = {
  method: "GET",
  url: "https://streaming-availability.p.rapidapi.com/search/filters",
  params: {
    services: "netflix",
    country: "in",
    output_language: "en",
    order_by: "year",
    genres: genreList[2],
    genres_relation: "and",
    desc: "true",
    show_type: "all",
  },
  headers: {
    "X-RapidAPI-Key": "7e44d74267msh71e9325de0cf9bbp1ac601jsnc32d1bdf7c7b",
    "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
  },
};

let passCounter = 0;
let failCounter = 0;

const fetchMovieListByGenre = async () => {
  let hasMore = false;
  let cursor = null;
  do {
    try {
      if (hasMore) {
        options.params.cursor = cursor;
      }
      const response = await axios.request(options);
      //console.log(response.data);
      if (response.data.result && response.data.result.length > 0) {
        let moviesList = response.data.result;
        for (let i = 0; i < moviesList.length; i++) {
          await Show.findOne({ imdbID: moviesList[i].imdbId })
            .then((res) => {
              if (!res) {
                fetchMovieDetails(
                  moviesList[i].imdbId,
                  moviesList[i].title,
                  moviesList[i].originalTitle
                );
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
      if (response.data.hasMore) {
        hasMore = true;
        cursor = response.data.nextCursor;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(error);
    }
  } while (hasMore);
};

const fetchMovieDetails = async (imdbId, title, originalTitle) => {
  try {
    const response = await axios.get(
      `http://www.omdbapi.com/?i=${imdbId}&apikey=94c086e4`
    );
    //console.log(response.data);
    const data = response.data;
    console.log(response.data.title);
    if (data && data.Title && data.Title.length > 0) {
      let genreArr = data.Genre.split(", ");
      let actorsArr = data.Actors.split(", ");
      const show = new Show({
        imdbID: data.imdbID,
        title: title,
        showType: data.Type,
        originalTitle: originalTitle,
        year: data.Year,
        rated: data.Rated,
        genre: genreArr,
        actors: actorsArr,
        plot: data.Plot,
        poster: data.Poster,
        imdbRating: data.imdbRating,
        imdbVotes: data.imdbVotes,
      });
      show
        .save()
        .then((res) => {
          passCounter++;
          console.log("Passes - " + passCounter);
        })
        .catch((err) => {
          failCounter++;
          console.log("Fails - " + failCounter);
        });
    } else {
      console.log(data);
      console.log(imdbId + ", " + title);
    }
  } catch (error) {
    console.error(error);
  }
};

fetchMovieListByGenre();
