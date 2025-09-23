require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();

const PORT = process.env.PORT || 3001;
const dbURI = process.env.MONGODB_URI;

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const login = require("./routes/login.js");
const student = require("./routes/student.js");
const course = require("./routes/course.js");
const batch = require("./routes/batch.js");
const transaction = require("./routes/transaction.js");
const authentication = require("./routes/authentication.js");
const trainer = require("./routes/trainer.js");
const onboard = require("./routes/onboard.js");
const moduleRouter = require("./routes/moduleRouter.js");
const Lecture = require("./routes/Lecture.js");

const Razorpay = require("./routes/paymentRoutes.js");
const getCoursesRouter = require("./routes/getCourses.js");

const Cloudflare = require("./routes/cloudflare.js");
const VerifyStudent = require("./routes/VerifyStudent.js");
const Settings = require("./routes/Settings.js");
const trainerPaymentRoute = require("./routes/trainerPaymentRoute.js");
const authenticate = require("./middlewares/authentication.js");

app.use("/api/login", login);
app.use("/api/student", student);
app.use("/api/course", course);
app.use("/api/batch", batch);
app.use("/api/transaction", transaction);
app.use("/api/authentication", authentication);
app.use("/api/trainer", trainer);
app.use("/api/onboard", onboard);
app.use("/api/module", moduleRouter);
app.use("/api/lecture", Lecture);
app.use("/api/get_courses", getCoursesRouter);
app.use("/api/payment", Razorpay);
app.use("/api/cloudflare", Cloudflare);
app.use("/api/verify_student", VerifyStudent);
app.use("/api/setting", Settings);

app.get("/api/auth/validate", authenticate, (req, res) =>
  res.status(200).json({ valid: true })
);

app.use("/api/trainer-payment", trainerPaymentRoute);

app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size should not exceed 5MB" });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});