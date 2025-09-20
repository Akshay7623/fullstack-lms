const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  razorpaySecret: {
    type: String,
    default: "",
  },

  razorpayKey: {
    type: String,
    default: "",
  },

  emailOnTimeChange: {
    type: Boolean,
    default: true,
  },

  emailOnTrainerAssign: {
    type: Boolean,
    default: true,
  },

  emailOnLectureCancel: {
    type: Boolean,
    default: true,
  },
  
  emailOnLectureReschedule: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Setting", SettingSchema);
