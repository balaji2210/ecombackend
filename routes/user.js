const express = require("express");

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  getLoggedInUser,
  logout,
  updateUser,
  updatePassword,
  adminGetAllUsers,
  adminUpdateUser,
} = require("../controllers/user");

const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/password/forgot").post(forgotPassword);
router.route("/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUser);
router.route("/logout").get(logout);
router.route("/updateuser").put(isLoggedIn, updateUser);
router.route("/update/password").put(isLoggedIn, updatePassword);

router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminGetAllUsers);

router
  .route("/admin/user/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateUser);

module.exports = router;
