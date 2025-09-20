const path = require("path");
const fs = require("fs");
const Trainer = require("../models/trainer");

const updateTeacherController = async (req, res) => {
  const photoFile = req.files?.photo?.[0];
  const resumeFile = req.files?.resume?.[0];
  const idDocumentFile = req.files?.id_document?.[0];

  const photoName = photoFile ? photoFile.filename : "";
  const resumeName = resumeFile ? resumeFile.filename : "";
  const idDocumentName = idDocumentFile ? idDocumentFile.filename : "";

  const {
    firstName,
    lastName,
    mobileNumber,
    email,
    gender,
    modules,
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
    batches,
    bankName,
    _id,
  } = req.body;

  const dbDoc = await Trainer.findById(_id);

  const existingPhoto = dbDoc.photo;
  const existingResume = dbDoc.resume;
  const existingId = dbDoc.id_document;

  if (req.body.govtIdType === "") {
    req.body.govtIdType = undefined;
  }

  try {
    const updateData = {
      firstName,
      lastName,
      mobileNumber,
      email,
      gender,
      modules,
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
      batches,
      rate,
      bankName
    };

    if (resumeName) {
      updateData.resume = resumeName;
    }

    if (photoName) {
      updateData.photo = photoName;
    }

    if(idDocumentName) {
      updateData.id_document = idDocumentName;
    }

    if ((req.body.removePhoto === "true" || photoName) && existingPhoto) {
      const oldFilePath = path.join(
        __dirname,
        "../uploads",
        "trainer",
        existingPhoto
      );
      fs.unlink(oldFilePath, (_) => {});

      if (!photoName) {
        updateData.photo = "";
      }
    }

    if (resumeName && existingResume) {
      const oldFilePath = path.join(
        __dirname,
        "../uploads",
        "trainer",
        existingResume
      );
      fs.unlink(oldFilePath, (_) => {});
    }

    if(existingId && idDocumentName) {
      const oldFilePath = path.join(__dirname,"../uploads","trainer",existingId);
      fs.unlink(oldFilePath,(_)=> { });
    }

    const update = await Trainer.findByIdAndUpdate(_id, updateData, {
      new: true,
    });
    return res.status(200).json({ data: update });
  } catch (Err) {
    console.log("Error at updateController:", Err);
    return res
      .status(500)
      .json({ message: "Some server error while updating" });
  }
};

module.exports = updateTeacherController;
