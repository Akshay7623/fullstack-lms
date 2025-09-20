const Setting = require("../models/settings");

const maskString = (str, visibleCount = 7) => {
  if (!str) return "";
  const maskLength = Math.max(0, str.length - visibleCount);
  return "*".repeat(maskLength) + str.slice(-visibleCount);
};

const getKeys = async (req, res) => {
  try {
    const dbSetting = await Setting.findOne({});

    if (!dbSetting) {
      return res.status(200).json({ secret: "", id: "" });
    } else {
      return res
        .status(200)
        .json({ secret: maskString(dbSetting.razorpaySecret), id: dbSetting.razorpayKey });
    }
  } catch (Err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getKeys;
