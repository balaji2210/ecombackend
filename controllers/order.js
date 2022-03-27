const Order = require("../models/Order");
const Product = require("../models/Product");

const BigPromise = require("../middlewares/Bigpromise");

exports.createOrder = BigPromise(async (req, res, next) => {
  const { shippingInfo, orderItems, taxAmount, shippingAmount, totalAmount } =
    req.body;

  if (
    !(shippingAmount || orderItems || taxAmount, shippingInfo || totalAmount)
  ) {
    return res.status(400).json({
      message: "All order Fileds are required",
    });
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    taxAmount,
    shippingAmount,
    totalAmount,
  });

  // console.log(order);

  return res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return res.status(400).json({
      message: "No Order found ",
    });
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrdersOfLoggedInUser = BigPromise(async (req, res, next) => {
  const orders = await Order.find({});

  if (!orders) {
    return res.status(400).json({
      message: "No order found in user Account",
    });
  }

  let items = [];
  orders.map((ord, i) => {
    items.push(ord.orderItems);
  });

  let ordObj = [];

  items.map((ite) => {
    ite.find((fi) => {
      if (fi.user._id.toString() === req.user._id.toString()) {
        ordObj.push(fi);
      }
    });
  });

  return res.status(200).json({
    success: true,
    orders: ordObj,
  });
});

exports.adminGetOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();
  const orderCount = await Order.countDocuments();

  if (!orders) {
    return res.status(400).json({
      message: "No orders",
    });
  }

  let items = [];
  orders.map((ord, i) => {
    items.push(ord.orderItems);
  });

  let ordObj = [];

  items.map((ite) => {
    ite.find((fi) => {
      ordObj.push(fi);
    });
  });

  let total = 0;
  orders.map((ord) => {
    total = total + ord.totalAmount;
  });

  // console.log(total);
  return res.status(200).json({
    success: true,
    orders: ordObj,
    total,
  });
});

exports.processingOrders = BigPromise(async (req, res, next) => {
  let orders = await Order.find({});

  if (!orders) {
    return res.status(400).json({
      message: "No processing Orders",
    });
  }

  let items = [];
  orders.map((ord, i) => {
    items.push(ord.orderItems);
  });

  let ordObj = [];

  items.map((ite) => {
    ite.find((fi) => {
      if (fi.orderStatus === "processing") {
        ordObj.push(fi);
      }
    });
  });

  return res.status(200).json({
    success: true,
    orders: ordObj,
  });
});

exports.updateOrderstatus = BigPromise(async (req, res, next) => {
  const orderStatus = "Delivered";

  const order = await Order.findOne({
    "orderItems._id": req.params.id,
  });

  order.orderItems.map((ord) => {
    if (ord._id.toString() === req.params.id.toString()) {
      ord.orderStatus = orderStatus;
    }
  });

  order.orderItems.forEach(async (prod) => {
    await updatedStock(prod.product, prod.quantity);
  });

  await order.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "order updated",
  });
});

exports.getDeliveredOrder = BigPromise(async (req, res, next) => {
  const orders = await Order.find({});

  if (!orders) {
    return res.status(400).json({
      message: "No delivered Orders",
    });
  }

  let items = [];
  orders.map((ord, i) => {
    items.push(ord.orderItems);
  });

  let ordObj = [];

  items.map((ite) => {
    ite.find((fi) => {
      if (fi.orderStatus === "Delivered") {
        ordObj.push(fi);
      }
    });
  });

  return res.status(200).json({
    success: true,
    orders: ordObj,
  });
});

exports.deleteOrder = BigPromise(async (req, res, next) => {
  await Order.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Order Deleted",
  });
});

async function updatedStock(productId, quantity) {
  const product = await Product.findById(productId);

  if (product.stock >= 1) {
    product.stock = product.stock - quantity;
  }

  await product.save({ validateBeforeSave: false });
}
