const Setting = require("../models/settings");

const updateKey = async (req, res) => {
  try {
    if (req.body.value === "DELETE") {
      req.body.value = "";
    }
    
    const { keyType, value } = req.body;
    const update = await Setting.updateMany({}, { [keyType]: value });
    return res.status(200).json({ message: `${keyType} updated successfully` });
  } catch (Err) {
    console.log("Some error is ", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateKey;
