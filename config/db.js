const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//mongoose.connect(db);
//instead of this above line we will use a better way where we get handle promises and exceptions

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.log(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
