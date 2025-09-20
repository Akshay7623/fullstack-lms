const Transaction=require("../models/transaction");

const updateTransactionController = (req,res)=>{
    console.log("get request from controller");
    const {datetime,amount,studentId,courseId,paymentMode,paymentReferenceId} = req.body;

    const transaction = new Transaction({
        datetime,
        amount,
        studentId,
        courseId,
        paymentMode,
        paymentReferenceId
    });

    try {
        transaction.save();
        return res.status(200).json({message:"Transaction updated successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal server"})
    }

    
}

module.exports = updateTransactionController;