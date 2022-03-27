const mongooose = require("mongoose");

exports.connectDB = () => {
  mongooose
    .connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB Connected");
    })
    .catch((err) => {
      console.log(`Error:`, err);
    });
};
