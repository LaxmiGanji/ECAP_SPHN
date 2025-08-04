require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://laxmiganji2005:Augtpaswd4$@cluster0.xqcmbub.mongodb.net/";
console.log("MongoURI:", mongoURI);

const connectToMongo = () => {
  mongoose
    .connect(mongoURI, { useNewUrlParser: true })
    .then(() => {
      console.log("Connected to MongoDB Successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB", error);
    });
};
 
module.exports = connectToMongo;
