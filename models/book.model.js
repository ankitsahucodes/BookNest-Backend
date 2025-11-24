const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: [String],
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    category: 
      {
        type: String,
        enum: [
          "Fiction",
          "Non-Fiction",
          "Romance",
          "Psychology",
          "Spirituality",
          "Fantasy",
          "Biography",
          "Business & Finance",
          "Biography",
          "Self-Help",
          "History",
          "Notebook"
        ],
        required: true,
      },
    imageUrl: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    mrp: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BookNest = mongoose.model("BookNest", bookSchema);

module.exports = BookNest;