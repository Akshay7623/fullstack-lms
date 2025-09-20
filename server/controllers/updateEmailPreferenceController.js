const Setting = require("../models/settings");

const updateEmailPreference = async (req, res) => {
  const { preferenceType } = req.body;

  try {
    const dbSettings = await Setting.findOne({});

    if (!dbSettings) {
      dbSettings = await Setting.create({
        emailOnTimeChange: true,
        emailOnTrainerAssign: true,
        emailOnLectureCancel: true,
        emailOnLectureReschedule:true,
        [preferenceType]: true,
      });
      return res.status(200).json({
        message: "Preference updated",
        data: {
          emailOnTimeChange: true,
          emailOnTrainerAssign: true,
          emailOnLectureCancel: true,
          emailOnLectureReschedule: true
        },
      });
    } else {
      const current = dbSettings[preferenceType];
      dbSettings[preferenceType] = !current;

      await dbSettings.save();
      return res
        .status(200)
        .json({
          message: "Preference updated",
          data: {
            emailOnTimeChange: dbSettings.emailOnTimeChange,
            emailOnTrainerAssign: dbSettings.emailOnTrainerAssign,
            emailOnLectureCancel: dbSettings.emailOnLectureCancel,
            emailOnLectureReschedule: dbSettings.emailOnLectureReschedule
          },
        });
    }
  } catch (Err) {
    console.log("Internal server error ", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateEmailPreference;