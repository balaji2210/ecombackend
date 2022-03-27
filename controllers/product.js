const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

const BigPromise = require("../middlewares/Bigpromise");
const WhereClause = require("../utils/whereClause");

exports.createProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];
  let result;
  console.log(req.files);
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "ecom",
        }
      );
      imageArray.push({
        public_id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  return res.status(200).json({
    success: true,
    product,
  });
});

exports.getProducts = BigPromise(async (req, res, next) => {
  const productCount = await Product.countDocuments();
  const resultPerPage = 8;
  const whereClause = new WhereClause(Product, req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await whereClause.query;

  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

exports.getAProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(400).json({
      message: "No product Found",
    });
  }
  return res.status(200).json({
    success: true,
    product,
  });
});

exports.updateProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(200).json({
      message: "No Product found",
    });
  }

  let imageArray = [];
  if (req.files) {
    for (let index = 0; index < product.photos.length; index++) {
      await cloudinary.uploader.destroy(product.photos[index].public_id);
    }

    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "ecom",
        }
      );
      imageArray.push({
        public_id: result.public_id,
        secure_url: result.secure_url,
      });
    }
    req.body.photos = imageArray;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  return res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(200).json({
      message: "No Product found",
    });
  }

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.uploader.destroy(product.photos[index].public_id);
  }

  await Product.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Product Deleted",
  });
});

//review routes
exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(req.params.id);

  const ALreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (ALreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.noOfReviews = product.reviews.length;
  }

  //adjust ratings
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.noOfReviews;

  await product.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    message: "added review",
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { id } = req.query;

  const product = await Product.findById(id);

  let reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  );

  let noOfReviews;

  //updtae product
  let total = 0;
  let ratings;

  if (reviews.length === 0) {
    (noOfReviews = 0), (ratings = 0);
  } else {
    noOfReviews = reviews.length;
    ratings = reviews.map((rev) => {
      total = total + rev.rating;
    });
    ratings = total / noOfReviews;
  }

  await Product.findByIdAndUpdate(
    id,
    {
      reviews,
      ratings,
      noOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getReviewsForProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
