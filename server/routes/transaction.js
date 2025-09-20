const express = require("express");
const multer = require("multer");

const addTransactionController = require("../controllers/addTransactionController.js");
const updateTransactionController = require("../controllers/updateTransactionController.js");
const authentication = require("../middlewares/authMiddleware.js");
const getTransactionController = require("../controllers/getTransactionController.js");
const sendMailController = require("../controllers/sendMailController.js");
const exportTransactionsController = require("../controllers/exportTransactionsController.js");
const searchTransactionController = require("../controllers/searchTransactionController.js");

const { isDateValid, isNullOrUndefined } = require("../utils/validation.js");

const upload = multer({ storage: multer.memoryStorage() });

const transaction = express.Router();

const addTransactionMiddleware = async (req, res, next) => {
  next();
};

const updateTransactionMiddleware = async (req, res, next) => {
  next();
};

const exportTransactionsMiddleware = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  if (isDateValid(startDate) && isDateValid(endDate)) {
    next();
  } else {
    return res.status(400).json({ message: "Invalid date !" });
  }
};

const searchTransactionMiddleware = async (req, res, next) => {
  const { name } = req.query;

  if(isNullOrUndefined(name) && typeof name !== "string") {
    return res.status(400).json({message:"Invalid name given"})
  }

  next();
};

const getTransactionMiddleware = async (req, res, next) => {
  const { page, pageSize } = req.query;
  const pageNumber = Number(page);
  const pageSizeInt = Number(pageSize);

  if (
    isNaN(pageNumber) ||
    isNaN(pageSizeInt) ||
    pageNumber < 0 ||
    pageSizeInt < 0
  ) {
    return res.status(400).json({ message: "Invalid page number or pageSize" });
  }

  next();
};

transaction.get(
  "/get",
  authentication,
  getTransactionMiddleware,
  getTransactionController
);
transaction.post(
  "/send-mail",
  authentication,
  upload.single("receipt"),
  sendMailController
);

transaction.get(
  "/export",
  authentication,
  exportTransactionsMiddleware,
  exportTransactionsController
);

transaction.get("/search", authentication, searchTransactionMiddleware, searchTransactionController);

transaction.post("/add", addTransactionMiddleware, addTransactionController);
transaction.put(
  "/update/:id",
  updateTransactionMiddleware,
  updateTransactionController
);

module.exports = transaction;
