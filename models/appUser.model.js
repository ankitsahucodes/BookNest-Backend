const mongoose = require("mongoose");

const AppUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    wishlist: [String],
    cart: [
      {
        bookId: String,
        quantity: Number,
      },
    ],

    orders: [
      {
        items: [
          {
            bookId: String,
            quantity: Number,
            price: Number,
          },
        ],
        totalItems: Number,
        totalAmount: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
          default: "Placed",
        },
        address: {
          houseNumber: String,
          street: String,
          city: String,
          state: String,
          pincode: String,
          country: String,
        },
      },
    ],

    addresses: [
      {
        houseNumber: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
          type: String,
          default: "India",
          immutable: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const AppUser = mongoose.model("AppUser", AppUserSchema);
module.exports = AppUser;
