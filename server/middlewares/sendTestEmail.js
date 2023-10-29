const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

// Initialize Mailchimp Configuration
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});



// Send Test Email via Mailchimp
async function sendTestEmail(req, res, next) {
  try {
    // Prepare the email content
    const newBody = req.body;
    const subject = `TEST EMAIL: ${ newBody.title }`;

    // Create a test campaign
    const campaign = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID,
      },
      settings: {
        subject_line: subject,
        from_name: process.env.MAILCHIMP_NAME,
        reply_to: process.env.MAILCHIMP_SENDER_EMAIL,
      },
    });
    // Add the content to the campaign
    const test_link = newBody.link || process.env.DEV_CLIENT;
    const test_content = {
      to: process.env.MAILCHIMP_TESTER_EMAIL,
      html: `<p>Hello *|FNAME|*,</p>
      <p>A new TEST NOTIFICATION has been created: ${ newBody.title } on ${ newBody.date }.</p>
      <p>
        ${ newBody.description.replace(/\n/g, "<br>") }
      </p>
      <p>Learn more: ${ test_link }</p>
      <p>***THIS IS A TEST EMAIL CONTENT FOR DEVELOPMENT!!!***</p>`,
      text: `Hello *|FNAME|*,\n
      A new TEST NOTIFICATION has been created: ${ newBody.title } on ${ newBody.date }.\n
      ${ newBody.description }\n
      Learn more: ${ test_link }\n
      ***THIS IS A TEST EMAIL CONTENT FOR DEVELOPMENT!!!***`,
    };

    // Add content to the campaign
    await mailchimp.campaigns.setContent(campaign.id, test_content);

    // Send the test campaign
    const sendTestEmail = await mailchimp.campaigns.sendTestEmail(campaign.id, {
      test_emails: [process.env.MAILCHIMP_TESTER_EMAIL],
      send_type: "plaintext", // Replace with your test email address
    });
    if (sendTestEmail && sendTestEmail.status !== "sent") {
      throw new Error("Unable to send test email notification!");
    }

    next();
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

module.exports = sendTestEmail;
