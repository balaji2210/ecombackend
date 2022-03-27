const express = require("express");
const {
  createOrder,
  getOneOrder,
  getOrdersOfLoggedInUser,
  adminGetOrders,
  processingOrders,
  updateOrderstatus,
  getDeliveredOrder,
  deleteOrder,
} = require("../controllers/order");
const router = express.Router();

const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/orders").get(isLoggedIn, getOrdersOfLoggedInUser);

router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetOrders);

router
  .route("/admin/orders/processing")
  .get(isLoggedIn, customRole("admin"), processingOrders);

router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), updateOrderstatus)
  .delete(isLoggedIn, customRole("admin"), deleteOrder);

router
  .route("/admin/orders/delivered")
  .get(isLoggedIn, customRole("admin"), getDeliveredOrder);

module.exports = router;
