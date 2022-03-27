const express = require("express");
const {
  createProduct,
  getProducts,
  getAProduct,
  deleteProduct,
  updateProduct,
  addReview,
  deleteReview,
  getReviewsForProduct,
} = require("../controllers/product");
const { isLoggedIn, customRole } = require("../middlewares/user");

const router = express.Router();

router
  .route("/create/product")
  .post(isLoggedIn, customRole("admin"), createProduct);
router.route("/products").get(getProducts);

router.route("/product/:id").get(getAProduct);

router
  .route("/product/update/:id")
  .put(isLoggedIn, customRole("admin"), updateProduct);

router
  .route("/product/delete/:id")
  .delete(isLoggedIn, customRole("admin"), deleteProduct);

//review routes
router.route("/review/:id").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getReviewsForProduct);

module.exports = router;
