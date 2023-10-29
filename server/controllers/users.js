const express = require("express");
const router = express.Router();

const User = require("../models/userSchema");
const addSubscriber = require("../middlewares/addSubscriber");
const welcomeSubscriber = require("../middlewares/welcomeSubscriber");



router.post("/signup", async (req, res, next) => {
  try {
    // Check if email is already taken
    const user = await User.findOne({email: req.body.email});
    if (user) {
      return res
        .status(400)
        .json({errors: {email: "*This email address is already taken.*"}});
    }

    // Create the user
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      companyName: req.body.companyName,
      jobs: req.body.jobs,
      contactNumber: req.body.contactNumber,
      address: req.body.address,
      town: req.body.town,
      country: req.body.country,
      developmentTechnologist: req.body.developmentTechnologist,
      course: req.body.course,
      year: req.body.year,
      agreement: req.body.agreement,
      notification: req.body.notification,
    });

    // Validate the user object before saving
    try {
      await newUser.validate();
    } catch (validationError) {
      console.error(validationError)
      return res.status(400).json({
        errors: {
          firstName: validationError.errors.firstName
            ? validationError.errors.firstName.message
            : "",
          lastName: validationError.errors.lastName
            ? validationError.errors.lastName.message
            : "",
          email: validationError.errors.email
            ? validationError.errors.email.message
            : "",
          password: validationError.errors.password
            ? validationError.errors.password.message
            : "",
          jobs: validationError.errors.jobs
            ? validationError.errors.jobs.message
            : "",
          contactNumber: validationError.errors.contactNumber
            ? validationError.errors.contactNumber.message
            : "",
          country: validationError.errors.country
            ? validationError.errors.country.message
            : "",
          developmentTechnologist: validationError.errors.developmentTechnologist
            ? validationError.errors.developmentTechnologist.message
            : "",
          course: validationError.errors.course
            ? validationError.errors.course.message
            : "",
          year: validationError.errors.year
            ? validationError.errors.year.message
            : "",
          agreement: validationError.errors.agreement
            ? validationError.errors.agreement.message
            : "",
        },
      });
    }

    await newUser.save();
    // Add the user's email to the Mailchimp list and send welcome email to the new user
    if (req.body.notification === true) {
      req.userId = newUser._id;
      // Call addSubscriber first and pass the callback for welcomeSubscriber
      addSubscriber(req, res, function (err) {
        if (err) {
          // Handle errors here if needed
          console.log(err);
          return res.status(500).json({error: "Unable to add subscriber."});
        } else {
          console.log("Subscriber added successfully!");
          // If addSubscriber is successful, call welcomeSubscriber and pass the final callback
          welcomeSubscriber(req, res, function (err) {
            if (err) {
              // Handle errors here if needed
              console.log(err);
              return res.status(500).json({error: "Unable to send welcome email."});
            } else {
              console.log("Welcome email sent successfully!");
            }
            next();
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "*User created successfully!*",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "*Unable to create a user!*",
      errors: error,
    });
  }
});

module.exports = router;
