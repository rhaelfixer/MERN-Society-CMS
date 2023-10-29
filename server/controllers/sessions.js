const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/userSchema");



router.post("/login", async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      return res
        .status(401)
        .json({errors: {email: "*Invalid email or password.*"}});
    }
    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({errors: {password: "*Invalid email or password.*"}});
    }
    console.log(user.role);
    // Generate a token
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      process.env.SESSION_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    res
      .status(200)
      .json({success: true, message: "*Login successful*", token: token});
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "*Unable to log in!*",
      errors: error,
    });
  }
});

module.exports = router;
