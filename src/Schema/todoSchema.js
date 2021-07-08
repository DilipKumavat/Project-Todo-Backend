const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
    task: String,
    done: Boolean,
    creationTime: Date,
    userId: mongoose.Schema.ObjectId,
  });

module.exports = todoSchema;