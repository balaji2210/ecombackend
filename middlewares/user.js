const jwt = require("jsonwebtoken");
const BigPromise = require("./Bigpromise.js");
const User = require("../models/User");

const CustomError = require("../utils/customError");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return next(new CustomError("Login To access", 400));
  }
  const decoed = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoed.id);
  req.user.password = undefined;
  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError("You are Not allowed for this", 402));
    }
    next();
  };
};
