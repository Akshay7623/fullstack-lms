const Lecture = require("../models/lectureSchedule");
const Batch = require("../models/batch");

const getLecture = async (req, res) => {
  try {
    const {
      courseId,
      trainerId,
      batchId,
      topic,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
      type,
    } = req.query;

    const query = {};
    const activeBatches = await Batch.find({ status: "active" }, "_id");
    const activeBatchIds = activeBatches.map((b) => String(b._id));

    
    if (type === "upcoming") {
      query.status = "scheduled";
    } else if (type === "complete") {
      query.status = "completed";
    }

    if (courseId) query.courseId = courseId;
    if (trainerId) query.trainerId = trainerId;
    if (batchId) query.batchId = batchId;

    if (batchId) {
      if (activeBatchIds.includes(batchId)) {
        query.batchId = batchId;
      } else {
        return res.status(200).json({ data: [], total: 0 });
      }
    } else {
      query.batchId = { $in: activeBatchIds };
    }

    if (topic) query.lectureTopic = { $regex: topic, $options: "i" };

    if (startDate && endDate) {
      query.plannedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const totalCount = await Lecture.countDocuments(query);
    
    const lectures = await Lecture.find(query)
      .sort({ plannedDate: 1 })
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));
    res.status(200).json({ data: lectures, total: totalCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getLecture;
