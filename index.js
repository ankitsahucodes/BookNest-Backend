const express = require("express");
const app = express();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const { initializeDatabase } = require("./db/db.connect");

const fs = require("fs");
const BookNest = require("./models/book.model");
const AppUser = require("./models/appUser.model");

app.use(express.json());

initializeDatabase();

const jsonData = fs.readFileSync("booksData.json", "utf-8");
const booksData = JSON.parse(jsonData);

function seedData() {
  try {
    for (const bookData of booksData) {
      const newBook = new BookNest({
        title: bookData.title,
        author: bookData.author,
        publishedYear: bookData.publishedYear,
        category: bookData.category,
        imageUrl: bookData.imageUrl,
        rating: bookData.rating,
        mrp: bookData.mrp,
        price: bookData.price,
        pages: bookData.pages,
        summary: bookData.summary,
      });

      newBook.save();
      // console.log(newBook.title)
    }
  } catch (error) {
    console.log("Error seeding the data", error);
  }
}

// seedData()

// create a new book

async function createBook(newBook) {
  try {
    const book = new BookNest(newBook);
    const savedBook = await book.save();
    return savedBook;
  } catch (error) {
    throw error;
  }
}

app.post("/books", async (req, res) => {
  try {
    const savedBook = await createBook(req.body);
    res
      .status(201)
      .json({ message: "Book added successfully", book: savedBook });
  } catch (error) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// read all books

async function readAllBooks() {
  try {
    const allBooks = await BookNest.find();
    return allBooks;
  } catch (error) {
    throw error;
  }
}

app.get("/books", async (req, res) => {
  try {
    const books = await readAllBooks();
    if (books.length != 0) {
      res.json(books);
    } else {
      res.status(404).json({ error: "No books found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books." });
  }
});

// get books by book id

async function readBookById(bookId) {
  try {
    const book = await BookNest.findOne({ _id: bookId });
    return book;
  } catch (error) {
    throw error;
  }
}

app.get("/books/:bookId", async (req, res) => {
  try {
    const book = await readBookById(req.params.bookId);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book." });
  }
});

// read Book By category

async function readBookByCategory(bookCategory) {
  try {
    const books = await BookNest.find({ category: bookCategory });
    return books;
  } catch (error) {
    throw error;
  }
}

app.get("/books/category/:bookCategory", async (req, res) => {
  try {
    const books = await readBookByCategory(req.params.bookCategory);
    if (books) {
      res.json(books);
    } else {
      res.status(404).json({ error: "Book not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book." });
  }
});

// Create new AppUser

async function createAppUser(newUser) {
  try {
    const user = new AppUser(newUser);
    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
    throw error;
  }
}

app.post("/profile", async (req, res) => {
  try {
    const savedUser = await createAppUser(req.body);
    res.status(201).json({
      message: "User added successfully",
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add user" });
  }
});

// Get AppUser by ID
async function getAppUserById(userId) {
  try {
    const user = await AppUser.findById(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

app.get("/profile/:userId", async (req, res) => {
  try {
    const user = await getAppUserById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Wishlist Api's

//get from wishlist

async function getWishlist(userId) {
  try {
    const user = await AppUser.findById(userId);
    return user.wishlist;
  } catch (error) {
    throw error;
  }
}

app.get("/wishlist/:userId", async (req, res) => {
  try {
    const wishlist = await getWishlist(req.params.userId);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// add to wishlist

async function addToWishlist(userId, bookId) {
  try {
    const user = await AppUser.findById(userId);

    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();
    }

    return user.wishlist;
  } catch (error) {
    throw error;
  }
}

app.post("/wishlist/:userId", async (req, res) => {
  try {
    const wishlist = await addToWishlist(req.params.userId, req.body.bookId);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// delete from wishlist

async function removeFromWishlist(userId, bookId) {
  try {
    const user = await AppUser.findById(userId);

    user.wishlist = user.wishlist.filter((id) => id !== bookId);

    await user.save();

    return user.wishlist;
  } catch (error) {
    throw error;
  }
}

app.delete("/wishlist/:userId", async (req, res) => {
  try {
    const updatedWishlist = await removeFromWishlist(
      req.params.userId,
      req.body.bookId
    );

    res.json(updatedWishlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

// Cart Api's

// add items to cart

async function addToCart(userId, bookId, quantity) {
  const user = await AppUser.findById(userId);

  const item = user.cart.find((i) => i.bookId === bookId);

  if (item) {
    item.quantity += quantity;

    if (item.quantity < 1) {
      user.cart = user.cart.filter((i) => i.bookId !== bookId);
    }
  } else {
    if (quantity > 0) {
      user.cart.push({ bookId, quantity });
    }
  }

  await user.save();
  return user.cart;
}

app.post("/cart/:userId", async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    const cart = await addToCart(req.params.userId, bookId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// get from cart

async function getCart(userId) {
  try {
    const user = await AppUser.findById(userId);
    return user.cart;
  } catch (error) {
    throw error;
  }
}

app.get("/cart/:userId", async (req, res) => {
  try {
    const cart = await getCart(req.params.userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// remove item from cart

async function removeFromCart(userId, bookId) {
  const user = await AppUser.findById(userId);

  user.cart = user.cart.filter((item) => item.bookId !== bookId);

  await user.save();
  return user.cart;
}

app.delete("/cart/:userId", async (req, res) => {
  try {
    const cart = await removeFromCart(req.params.userId, req.body.bookId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// address management

// post an address
async function addAddress(userId, addressData) {
  try {
    const user = await AppUser.findById(userId);
    user.addresses.push(addressData);
    await user.save();
    return user.addresses;
  } catch (error) {
    throw error;
  }
}

app.post("/address/:userId", async (req, res) => {
  try {
    const updatedAddresses = await addAddress(req.params.userId, req.body);
    res.json(updatedAddresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to add address" });
  }
});

// get all addresses
async function readAllAddresses(userId) {
  try {
    const user = await AppUser.findById(userId);
    return user.addresses;
  } catch (error) {
    throw error;
  }
}

app.get("/address/:userId", async (req, res) => {
  try {
    const addresses = await readAllAddresses(req.params.userId);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

// delete address

async function deleteAddress(userId, addressId) {
  try {
    const user = await AppUser.findById(userId);

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();
    return user.addresses;
  } catch (error) {
    throw error;
  }
}

app.delete("/address/:userId/:addressId", async (req, res) => {
  try {
    const updatedAddresses = await deleteAddress(
      req.params.userId,
      req.params.addressId
    );

    res.json(updatedAddresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// update address

async function updateAddress(userId, addressId, updatedData) {
  try {
    const user = await AppUser.findById(userId);

    if (!user) return null;

    const addrIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addrIndex === -1) {
      return null;
    }

    user.addresses[addrIndex] = {
      ...user.addresses[addrIndex],
      ...updatedData,
      country: "India",
    };

    await user.save();
    return user.addresses;
  } catch (error) {
    throw error;
  }
}

app.post("/address/update/:userId/:addressId", async (req, res) => {
  try {
    const updatedAddresses = await updateAddress(
      req.params.userId,
      req.params.addressId,
      req.body
    );

    if (!updatedAddresses) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json(updatedAddresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to update address" });
  }
});

// order placed

async function orderPlace(userId, orderData) {
  try {
    const user = await AppUser.findById(userId);
    user.orders.push(orderData);
    user.cart = [];
    await user.save();
    return user.orders;
  } catch (error) {
    throw error;
  }
}

app.post("/order-placed/:userId", async (req, res) => {
  try {
    const newOrder = await orderPlace(req.params.userId, req.body);
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
