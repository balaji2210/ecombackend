const User = require("../models/User");

const BigPromise = require("../middlewares/Bigpromise");
const CustomError = require("../utils/customError");
const { cookieToken } = require("../utils/cookieToken");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!(name || email || password)) {
    return res.status(400).json({
      message: "All field are required",
    });
  }

  const existUser = await User.findOne({ email });

  if (existUser) {
    return res.status(400).json({
      success: false,
      message: "User Email already exists",
    });
  } else {
    const user = await User.create(req.body);

    cookieToken(user, res);
  }
});

exports.signin = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email || password)) {
    return res.status(400).json({
      message: "email and password is required",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "No user found with email",
    });
  }
  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(400).json({
      message: "Wrong Email or password",
    });
  }
  cookieToken(user, res);
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: "No Email found",
    });
  }
  const token = user.getForgorPasswordToken();

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    token: token,
  });
});

exports.resetPassword = BigPromise(async (req, res, next) => {
  const { token } = req.params;

  const valid = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: valid,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      message: "Wrong Link or link Expired",
    });
  }

  if (req.body.password === req.body.confirmpassword) {
    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    cookieToken(user, res);
  } else {
    return res.status(400).json({
      message: "password and coonfirm password does not match",
    });
  }
});

exports.getLoggedInUser = BigPromise(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({
      message: "Login to access dashboard",
    });
  }
  return res.status(200).json({
    success: true,
    user,
  });
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null);
  req.user = null;
  return res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

exports.updateUser = BigPromise(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    useFindAndModify: false,
  });
  return res.status(200).json({
    success: true,
    message: "User Updated",
  });
});

exports.updatePassword = BigPromise(async (req, res, next) => {
  const { password, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "confirm password and new password do not match",
    });
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(400).json({
      message: "Login",
    });
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(400).json({
      message: "Wrong password",
    });
  }
  user.password = confirmPassword;

  await user.save();
  return res.status(200).json({
    success: true,
    message1: "password changed",
  });
});

exports.adminGetAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find().select("-password");

  if (!users) {
    return res.status(400).json({
      message: "No Users found",
    });
  }

  return res.status(200).json({
    success: true,
    users,
  });
});

exports.adminUpdateUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user._id.toString() === "6240af894cf0456e70c85376") {
    return res.status(200).json({
      success: false,
      message: "Super Admin role Cannot be Changed",
    });
  }
  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "User Updated",
  });
});
