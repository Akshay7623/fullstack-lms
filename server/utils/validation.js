// utils/validation.js
const mongoose = require("mongoose");

const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isMobile = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

const isPanCard = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const isAadhar = (aadhar) => {
  const aadharRegex = /^\d{12}$/;
  return aadharRegex.test(aadhar);
};

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

const isDateValid = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isPositiveNumber = (value) => {
  return typeof value === "number" && value > 0;
};

const isNullOrUndefined = (value) => {
  return value == null || value == undefined;
};
const isNonEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

const isEnumValue = (value, allowedValues) => {
  return allowedValues.includes(value);
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  isEmail,
  isMobile,
  isPanCard,
  isAadhar,
  isNonEmptyString,
  isDateValid,
  isPositiveNumber,
  isNullOrUndefined,
  isNonEmptyArray,
  isEnumValue,
  isValidObjectId,
};
