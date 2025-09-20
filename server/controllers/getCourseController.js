const Course = require("../models/course")

const getCourse = async (req,res)=>{
    const data = await Course.find({});
    return res.status(200).json({data:data});
}

module.exports  = getCourse