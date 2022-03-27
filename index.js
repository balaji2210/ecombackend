require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");
const cloudinary = require("cloudinary");

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running");
});
