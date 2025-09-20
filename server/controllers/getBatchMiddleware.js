const batch = require("../models/batch.js");

const getBatch = async (req,res)=>{
    const data = await batch.find({});
    return res.status(200).json({data:data});
}


module.exports  = getBatch