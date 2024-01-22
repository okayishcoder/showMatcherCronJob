const mongoose = require("mongoose");

const { Schema } = mongoose;

const showSchema = new Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  showType: {
    type: String,
    required: true,
  },
  originalTitle: String,
  year: String,
  rated: String,
  genre: [String],
  actors: [String],
  plot: String,
  poster: String,
  imdbRating: String,
  imdbVotes: String,
});

module.exports = mongoose.model("Show", showSchema);
