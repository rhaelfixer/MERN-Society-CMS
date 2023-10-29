const express = require("express");
const router = express.Router();

const User = require("../models/userSchema");
const authenticateToken = require("../middlewares/authenticateToken");
const updateSubscriber = require("../middlewares/updateSubscriber");



router.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const decodedUserId = req.userId;

    // Check if the user ID in the token matches the requested user ID
    if (decodedUserId !== userId) {
      return res.status(401).json({error: "Unauthorized"});
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    res.status(200).json({user});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});



router.put("/user/:id", authenticateToken, async (req, res, next) => {
  const userId = req.userId;
  const decodedUserId = req.userId;

  // Check if the user ID in the token matches the requested user ID
  if (decodedUserId !== userId) {
    return res.status(401).json({error: "Unauthorized"});
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Only update the fields that are included in the request body
    if (req.body.firstName) {
      user.firstName = req.body.firstName;
    }
    if (req.body.lastName) {
      user.lastName = req.body.lastName;
    }
    if (req.body.email) {
      const existingUser = await User.findOne({email: req.body.email});
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          errors: {
            email: "Email already exists!",
          },
        });
      }
      user.email = req.body.email;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.companyName) {
      user.companyName = req.body.companyName;
    }
    if (req.body.jobs) {
      user.jobs = req.body.jobs;
    }
    if (req.body.contactNumber) {
      user.contactNumber = req.body.contactNumber;
    }
    if (req.body.address) {
      user.address = req.body.address;
    }
    if (req.body.town) {
      user.town = req.body.town;
    }
    if (req.body.country) {
      user.country = req.body.country;
    }

    // Call the updateSubscriber middleware and wait for it to complete
    await updateSubscriber(req, res, next);

    // Save the updated user object to the database
    user.save();
    console.log("User updated and saved successfully!");

    res.status(200).json({success: true});
  } catch (validationError) {
    console.log(validationError)
    res.status(400).json({
      errors: {
        email: validationError.errors.email
          ? validationError.errors.email.message
          : "",
        password: validationError.errors.password
          ? validationError.errors.password.message
          : "",
        contactNumber: validationError.errors.contactNumber
          ? validationError.errors.contactNumber.message
          : "",
      },
    });
  }
});

module.exports = router;
