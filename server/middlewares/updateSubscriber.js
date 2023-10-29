const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

const User = require("../models/userSchema");

// Initialize Mailchimp Configuration
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});



// Update a subscriber's email in the Mailchimp list
async function updateSubscriberEmail(oldEmail, newEmail) {
  try {
    const listId = process.env.MAILCHIMP_LIST_ID;
    const response = await mailchimp.lists.updateListMember(listId, oldEmail, {
      email_address: newEmail,
    });
    console.log("Subscriber email updated in Mailchimp:", response);
  } catch (error) {
    console.error("Error updating subscriber email in Mailchimp", error);
    throw error;
  }
}



// Update a subscriber's first name and last name in the Mailchimp list
async function updateSubscriberDetails(email, firstName, lastName) {
  try {
    const listId = process.env.MAILCHIMP_LIST_ID;

    // Create the body object with the required parameters
    const body = {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    };

    // Call the updateListMember method with listId and body
    const response = await mailchimp.lists.updateListMember(listId, email, body);
    console.log("Subscriber details (first name and last name) updated in Mailchimp:", response);
  } catch (error) {
    console.error("Error updating subscriber details in Mailchimp", error);
    throw error;
  }
}



// Update the user's details to the Mailchimp list
async function updateSubscriber(req, res, next) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const notification = user.notification;

    if (notification === true) {
      // Check if the email has changed
      if (req.body.email && req.body.email !== email) {
        // Call the Mailchimp API to update the subscriber's email
        await updateSubscriberEmail(email, req.body.email);
        console.log("Subscriber email updated successfully!");
        // Update the email in the user object as well
        user.email = req.body.email;
      }

      // Check if the first name or last name has changed
      let firstNameChanged = false;
      let lastNameChanged = false;

      if (req.body.firstName && req.body.firstName !== firstName) {
        firstNameChanged = true;
        user.firstName = req.body.firstName;
      }

      if (req.body.lastName && req.body.lastName !== lastName) {
        lastNameChanged = true;
        user.lastName = req.body.lastName;
      }

      // Call the Mailchimp API to update the first name and last name if any of them changed
      if (firstNameChanged || lastNameChanged) {
        await updateSubscriberDetails(user.email, user.firstName, user.lastName);
        console.log("Subscriber details (first name and last name) updated successfully!");
      }

      // Save the updated user object to the database
      await user.save();
      console.log("User updated successfully!");
    }

    next();
  } catch (error) {
    console.error("Error updating subscriber", error);
    next(error);
  }
}

module.exports = updateSubscriber;
