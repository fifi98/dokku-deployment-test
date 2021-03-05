const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  password: {
    type: String,
    default: "123",
  },
});

module.exports = mongoose.model("User", userSchema);
