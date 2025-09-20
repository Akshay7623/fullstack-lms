const Trainer = require("../models/trainer");

const addTrainerController = async (req, res) => {
  const photoFile = req.files?.photo?.[0];
  const resumeFile = req.files?.resume?.[0];
  const documentFile = req.files?.id_document?.[0];

  const photoName = photoFile ? photoFile.filename : "";
  const resumeName = resumeFile ? resumeFile.filename : "";
  const idDocumentName = documentFile ? documentFile.filename : "";

  const existingTrainer = await Trainer.find({ email: req.body.email });

  if (existingTrainer.length) {
    return res.status(409).json({ message: "Email already exist" });
  }

  if (req.body.govtIdType === "") {
    req.body.govtIdType = undefined;
  }

  const {
    firstName,
    lastName,
    mobileNumber,
    email,
    gender,
    modules,
    registrationDate,
    city,
    address,
    state,
    course,
    professionalSummary,
    dateOfBirth,
    panCard,
    govtIdType,
    govtId,
    accountName,
    accountNumber,
    ifscCode,
    rate,
    bankName
  } = req.body;

  const teacher = new Trainer({
    firstName,
    lastName,
    mobileNumber,
    email,
    gender,
    modules,
    registrationDate,
    city,
    address,
    state,
    dateOfBirth,
    course,
    professionalSummary,
    panCard,
    govtIdType,
    accountName,
    accountNumber,
    ifscCode,
    govtId,
    rate,
    bankName,
    photo: photoName,
    resume: resumeName,
    id_document: idDocumentName,
  });

  try {
    await teacher.save();
    return res.status(201).json({ message: "Trainer added successfully" });
  } catch (error) {
    console.log("Some error while adding ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = addTrainerController;