const Batch= require("../models/batch");

const updateBatchController = (req,res)=>{
    console.log("get request from controller");
    const { month, year, courseName, batchNo, startDate } = req.body;

    const batch = new Batch({
        month,
        year,
        courseName,
        batchNo,
        startDate})

    try {
        batch.save();
        return res.status(200).json({message:"Batch updated successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal server"})
    }
    
}

module.exports = updateBatchController;