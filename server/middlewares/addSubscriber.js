const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

const User = require("../models/userSchema");

// Initialize Mailchimp Configuration
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});



// Add a subscriber to the Mailchimp list
async function addSubscriberToList(email, firstName, lastName) {
  try {
    const listId = process.env.MAILCHIMP_LIST_ID;
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    });
    console.log("Subscriber added:", response);
  } catch (error) {
    console.error(error);
  }
}



// Add the user to the Mailchimp list when user's notification is true
async function addSubscriber(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const notification = user.notification;

    if (notification === true) {
      await addSubscriberToList(email, firstName, lastName);
    }

    next();
  } catch (error) {
    console.error("Error adding subscriber", error);
    next(error);
  }
}

module.exports = addSubscriber;
