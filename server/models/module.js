const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

const Module = mongoose.model("module", moduleSchema);

module.exports = Module;
