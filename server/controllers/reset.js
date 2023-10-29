const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/userSchema");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



router.post("/password", async (req, res) => {
  const {email} = req.body;
  console.log(`Email received: ${ email }`);

  // Retrieve user from database
  const user = await User.findOne({email});
  if (!user) {
    return res.status(404).send(`User with email ${ email } not found`);
  }

  // Generate JWT token with the user's email
  const resetToken = jwt.sign({email: user.email}, process.env.REFRESH_TOKEN, {
    expiresIn: "30m",
  });
  console.log(resetToken);

  // Send reset JWT token to user's email using SendGrid
  const resetLink = process.env.NODE_ENV === "production"
    ? `${ process.env.PROD_CLIENT }/reset-password/${ resetToken }`
    : `${ process.env.DEV_CLIENT }/reset-password/${ resetToken }`;
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: "Password Reset",
    text: `To reset your password, please click on this link: ${ resetLink }`,
  };
  try {
    await sgMail.send(msg);
    console.log("Reset token sent");
    res.send("Reset token sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send reset token");
  }
});



router.post("/password/:resetToken", async (req, res) => {
  try {
    const {password} = req.body;
    const resetToken = req.params.resetToken;
    const decodedToken = jwt.verify(resetToken, process.env.REFRESH_TOKEN);
    const email = decodedToken.email;
    // Find the user document by email
    const user = await User.findOne({email: email});
    if (!user) {
      return res.status(404).json({success: false, errors: "Invalid token"});
    }
    // Update the password and save the user document
    user.password = password;
    try {
      await user.validate();
    } catch (validationError) {
      return res.status(400).json({
        errors: {
          password: validationError.errors.password
            ? validationError.errors.password.message
            : "",
        },
      });
    }
    await user.save();
    res.status(200).json({success: true});
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, errors: "Server error"});
  }
});

module.exports = router;
