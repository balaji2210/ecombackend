const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required field"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email is required field"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "user",
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.validatePassword = async function (usersendpassword) {
  return bcrypt.compare(usersendpassword, this.password);
};

userSchema.methods.getJwt = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET);
};

userSchema.methods.getForgorPasswordToken = function () {
  //generate long string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
