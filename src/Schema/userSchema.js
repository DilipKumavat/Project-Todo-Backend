const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    mobile: Number,
    email: String,
  });

module.exports= mongoose.model("userModel", userSchema);