const mongoose = require("mongoose");
const todoSchema = new mongoose.Schema({
  task: String,
  priority: String,
  done: Boolean,
  creationTime: Date,
  userId: mongoose.Schema.ObjectId,
  startDateOfTodo: String,
  endDateOfTodo: String,
});

module.exports = todoSchema;
