const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

// Initialize Mailchimp Configuration
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});



// Send Update Event Notification via Mailchimp
async function updateEventNotification(req, res, next) {
  try {
    // Get list of subscribers from your audience
    const listId = process.env.MAILCHIMP_LIST_ID;
    const response = await mailchimp.lists.getListMembersInfo(listId);

    if (!response) {
      throw new Error("Failed to retrieve list of subscribers from Mailchimp!");
    }

    if (!response.members || response.members.length === 0) {
      throw new Error(
        "There are no subscribers in the Mailchimp audience list!"
      );
    }

    // Prepare the email content
    const newEvent = req.body;
    const subject = `Updated Event: ${ newEvent.title }`;
    // Create a new campaign
    const campaign = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: process.env.MAILCHIMP_LIST_ID,
        merge_tags: {
          FNAME: "*|FNAME|*",
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
    const learnMoreLink = newEvent.link || `${ URL }/events`;
    const content = {
      to: `*|EMAIL|*`,
      html: `<p>Hello *|FNAME|*,</p>
      <p>The ${ newEvent.title } on ${ newEvent.date } has been updated.</p>
      <p>${ newEvent.description }</p>
      <p>Learn more: ${ learnMoreLink }</p>`,
      text: `Hello *|FNAME|*,\n
      The ${ newEvent.title } on ${ newEvent.date } has been updated.\n
      ${ newEvent.description }\n
      Learn more: ${ learnMoreLink }`,
    };

    await mailchimp.campaigns.setContent(campaign.id, content);

    // Send the campaign
    const sendEmail = await mailchimp.campaigns.send(campaign.id);
    if (sendEmail && sendEmail.status !== "sent") {
      throw new Error(`Unable to send updated email notification: ${ sendEmail.title }`);
    }

    next();
  } catch (error) {
    console.log(error);
    throw new Error("Unable to send updated email notification!");
  }
}

module.exports = updateEventNotification;
