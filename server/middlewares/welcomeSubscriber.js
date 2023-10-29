const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

const User = require("../models/userSchema");

// Initialize Mailchimp Configuration
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});



// Send Welcome Message to Subscriber
async function welcomeSubscriber(req, res, next) {
  try {
    // Check if notification is required
    if (req.body.notification === false) {
      // Notification not required, continue to the next middleware or route handler
      return next();
    }

    // Get the user's email from the Mailchimp list
    const userId = req.userId;
    const user = await User.findById(userId);
    const email = user.email;
    const firstName = user.firstName;
    const response = await mailchimp.lists.getListMembersInfo(process.env.MAILCHIMP_LIST_ID, email);

    if (!response || response.status === "subscribed") {
      // User is already subscribed, continue to the next middleware or route handler
      return next();
    }

    // Prepare the email content
    const subject = "Welcome to our newsletter!";
    // Create a new campaign
    const campaign = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID,
        segment_opts: {
          match: "all",
          conditions: [
            {
              condition_type: "TextMerge",
              field: "EMAIL",
              op: "is",
              value: email,
            },
          ],
        },
      },
      settings: {
        subject_line: subject,
        from_name: process.env.MAILCHIMP_NAME,
        reply_to: process.env.MAILCHIMP_SENDER_EMAIL,
      },
    });
    // Add the content to the campaign
    const URL = process.env.NODE_ENV === "production" ? process.env.PROD_CLIENT : process.env.DEV_CLIENT;
    const homeLink = URL;
    const content = {
      to: email, // Use the user's actual email address
      html: `<p>Hello ${ firstName },</p>
      <p>Thank you for subscribing to our newsletter!</p>
      <p>Learn more: ${ homeLink }</p>`,
      text: `Hello ${ firstName },\n
      Thank you for subscribing to our newsletter!\n
      Learn more: ${ homeLink }`,
    };

    await mailchimp.campaigns.setContent(campaign.id, content);

    // Send the campaign
    const welcomeEmail = await mailchimp.campaigns.send(campaign.id);

    if (welcomeEmail && welcomeEmail.status !== "sent") {
      throw new Error(`Unable to send welcome email!`);
    }

    next();
  } catch (error) {
    console.log(error);
    throw new Error("Unable to send email notification!");
  }
}

module.exports = welcomeSubscriber;
