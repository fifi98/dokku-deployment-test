const mongoose = require("mongoose");

const photoSchema = mongoose.Schema({
  name: {
    type: String,
  },
});

module.exports = mongoose.model("Photo", photoSchema);
