const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();
require('dotenv').config();

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newAdmin = new Admin({
            username: req.body.username.trim(),
            password: hashedPassword,
        });
        await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering admin", error });
    }
});

router.post('/login', async (req, res) => {
    try {

        const username = req.body.username.trim()
        const { password } = req.body

        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ message: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login error", error });
    }
});

module.exports = router;
