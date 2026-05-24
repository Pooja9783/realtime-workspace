"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post("/signup", async (req, res) => {
    console.log("Auth routes loaded");
    try {
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt_1.default.hash(password, 10);
        // check if user exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User is already exists" });
        }
        // create user
        const user = await User_1.User.create({
            name,
            email,
            password: hashPassword,
        });
        res.status(201).json({
            message: "User created successfully",
            user,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            err,
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // step 1. check if user exists
        const user = await User_1.User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credential" });
        // step 2. Compare Password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid Credential" });
        // step 3. Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, name: user.name, email: user.email }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        return res.status(200).json({ message: "Login Successfully", token });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error" });
    }
});
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Expiry time for OTP (5 minutes)
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        // upsert user
        let user = await User_1.User.findOne({ email });
        if (!user) {
            user = await User_1.User.create({ email });
        }
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        console.log("OTP", otp);
        res.json({ message: "OTP sent successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});
router.post("/verify-otp", async (req, res) => {
    console.log("Outside Try");
    try {
        console.log("Inside Try");
        const { email, otp } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP Expired" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
        }, process.env.SECRET_KEY, { expiresIn: "1d" });
        // Clear OTP and Expiry
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.json({ message: "OTP verified successfully", token });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});
exports.default = router;
