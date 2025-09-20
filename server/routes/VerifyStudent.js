const express = require("express");
const axios = require("axios");
const getStudentInfoController = require("../controllers/getStudentInfoController.js");
const secretKey = process.env.TURNSTILE_SECRET_KEY;
const router = express.Router();

const getMiddleware = async (req, res, next) => {
    const { token, mobile } = req.query;
    const ip = req.ip;

    if (mobile === undefined || mobile === null || (typeof mobile ==="string" && mobile.toString().length != 10)) {
        return res.status(400).json({ message: "Invalid mobile number" })
    }

    try {
        const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", token);
        formData.append("remoteip", ip);

        const result = await axios.post(verifyURL, formData.toString(), {headers: {"Content-Type": "application/x-www-form-urlencoded"}});
        const data = result.data;
        
        if (data.success) {
            next();
        } else {
            return res.status(400).json({ success: false, message:"Invalid token sent by user" });
        }
    } catch (Err) {
        return res.status(500).json({message:"Internal server error"});
    }
}


router.get("/", getMiddleware, getStudentInfoController)

module.exports = router;