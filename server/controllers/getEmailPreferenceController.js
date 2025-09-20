const Setting = require("../models/settings");

const getEmailPreference = async (req, res) => {
  try {
    const dbSetting = await Setting.findOne({});

    if (!dbSetting) {
      const newSettings = new Setting({
        emailOnTimeChange: true,
        emailOnTrainerAssign: true,
        emailOnLectureCancel: true,
        emailOnLectureReschedule: true,
      });

      await newSettings.save();

      return res.status(200).json({
        data: {
          emailOnTimeChange: true,
          emailOnTrainerAssign: true,
          emailOnLectureCancel: true,
          emailOnLectureReschedule: true,
        },
      });
    } else {
      return res.status(200).json({
        data: {
          emailOnTimeChange: dbSetting.emailOnTimeChange,
          emailOnTrainerAssign: dbSetting.emailOnTrainerAssign,
          emailOnLectureCancel: dbSetting.emailOnLectureCancel,
          emailOnLectureReschedule: dbSetting.emailOnLectureReschedule
        },
      });
    }
  } catch (Err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getEmailPreference;
