const TrainerPayment = require("../models/trainerPayment");
//perPage,pageNo
const getTrainerPaymentsController = async (req, res) => {
 try{
  const{perPage,pageNo}=req.query;

  const limit=parseInt(perPage);
  const skip = parseInt((pageNo)-1)*limit;

  const [total,payments] = await Promise.all([
    TrainerPayment.countDocuments(),
    TrainerPayment.find().sort({lectureDate:-1}).skip(skip).limit(limit),
  ]);

 return res.status(200).json({
      totalItems: total,
      currentPage: parseInt(pageNo),
      perPage: limit,
      totalPages: Math.ceil(total / limit),
      payments,
    });
  } catch (error) {
    console.error("Pagination error:", error);
    return res.status(500).json({ message: "Failed to fetch paginated trainer payments" });
  }
 
};

module.exports = getTrainerPaymentsController;
