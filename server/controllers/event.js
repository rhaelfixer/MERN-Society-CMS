const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const {DateTime} = require("luxon");

const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

// Initialize Cloudinary Configuration
if (process.env.NODE_ENV === "production") {
  cloudinary.config({
    cloud_name: process.env.CLOUD_PROD_NAME,
    api_key: process.env.CLOUD_PROD_API_KEY,
    api_secret: process.env.CLOUD_PROD_API_SECRET
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUD_DEV_NAME,
    api_key: process.env.CLOUD_DEV_API_KEY,
    api_secret: process.env.CLOUD_DEV_API_SECRET
  });
}

const FOLDER = process.env.NODE_ENV === "production" ? process.env.CLOUD_PROD_FOLDER : process.env.CLOUD_DEV_FOLDER;

const Event = require("../models/eventSchema");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const sendEventNotification = require("../middlewares/sendEventNotification");
const updateEventNotification = require("../middlewares/updateEventNotification");
const deleteEventNotification = require("../middlewares/deleteEventNotification");
const sendTestEmail = require("../middlewares/sendTestEmail");

const SEND_EVENT_NOTIFICATION = process.env.NODE_ENV === "production" ? sendEventNotification : sendTestEmail;
const UPDATE_EVENT_NOTIFICATION = process.env.NODE_ENV === "production" ? updateEventNotification : sendTestEmail;
const DELETE_EVENT_NOTIFICATION = process.env.NODE_ENV === "production" ? deleteEventNotification : sendTestEmail;



router.post("/create", authenticateToken, isAdmin, upload.single("image"), async (req, res, next) => {
  try {
    // Declare imageUrl variable outside the if statement
    let imageUrl = "";

    // Extract data from the request body
    const {title, date, description, link} = req.body;

    // Create the Event
    const newEvent = new Event({
      title,
      date,
      description,
      link,
      image: imageUrl,
    });

    // Validate the event object before saving
    try {
      await newEvent.validate();
    } catch (validationError) {
      return res.status(400).json({
        errors: {
          title: validationError.errors.title
            ? validationError.errors.title.message
            : "",
          date: validationError.errors.date
            ? validationError.errors.date.message
            : "",
          description: validationError.errors.description
            ? validationError.errors.description.message
            : "",
          link: validationError.errors.link
            ? validationError.errors.link.message
            : "",
        },
      });
    }

    // Check if an image file was uploaded
    if (req.file) {
      const fileBuffer = req.file.buffer; // Get the file buffer from the request
      const originalFilename = req.file.originalname;
      const fileNameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, "");

      // Create a readable stream from the file buffer
      const stream = streamifier.createReadStream(fileBuffer);

      // Upload the file stream to Cloudinary and get the response
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {folder: FOLDER, public_id: fileNameWithoutExtension, overwrite: true},
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.pipe(uploadStream);
      });
      console.log(cloudinaryResponse);

      // Check if the Cloudinary upload was successful and extract the image URL
      if (cloudinaryResponse.secure_url) {
        console.log("Upload file to Cloudinary!");
        const imageUrl = cloudinaryResponse.secure_url;
        console.log(imageUrl)

        // Set the image URL in the newEvent object
        newEvent.image = imageUrl;
      } else {
        throw new Error("Unable to upload file to Cloudinary!");
      }
    }

    // Save the event
    await newEvent.save();

    // Send the event notification asynchronously
    SEND_EVENT_NOTIFICATION(req, res, next)
      .then(() => {
        console.log("Event Notification sent successfully!");
      })
      .catch(error => {
        console.error("Error sending notification:", error);
      });

    res.status(200).json({
      success: true,
      message: "Event created successfully!",
      data: newEvent,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to create an event!",
      errors: error,
    });
  }
});



router.get("/getEvents", async (req, res) => {
  try {
    const event = await Event.find().sort({date: -1});

    if (!event) {
      return res.status(404).json({error: "No events found"});
    }

    res.status(200).json({event});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});



router.get("/preview/:id", async (req, res, next) => {
  const {id} = req.params;
  try {
    // Find the event in the database by its id
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }
    if (event.link) {
      // Fetch the HTML for the URL using axios
      const {data} = await axios.get(event.link);

      // Use cheerio to parse the HTML and extract the Open Graph metadata
      const $ = cheerio.load(data);
      const metadata = {};
      $("meta").each((i, el) => {
        const property = $(el).attr("property");
        if (property && property.startsWith("og:")) {
          metadata[property.slice(3)] = $(el).attr("content");
        }
      });

      // Return the metadata in the response
      res.json(metadata);
    } else {
      // Return an empty object to indicate no metadata is available
      res.json({});
    }
  } catch (err) {
    next(err);
  }
});



router.put("/update/:id", authenticateToken, isAdmin, upload.single("image"), async (req, res, next) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    // Only update the fields that are included in the request body
    if (req.body.title) {
      event.title = req.body.title;
    }
    if (req.body.date) {
      event.date = req.body.date;
    }
    if (req.body.description) {
      event.description = req.body.description;
    }
    if (req.body.link) {
      event.link = req.body.link;
    }

    // Check if an image file was uploaded
    if (req.file) {
      const fileBuffer = req.file.buffer; // Get the file buffer from the request
      const originalFilename = req.file.originalname;
      const fileNameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, "");

      // Create a readable stream from the file buffer
      const stream = streamifier.createReadStream(fileBuffer);

      // Upload the file stream to Cloudinary and get the response
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {folder: FOLDER, public_id: fileNameWithoutExtension, overwrite: true},
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.pipe(uploadStream);
      });
      console.log(cloudinaryResponse);

      // Check if the Cloudinary upload was successful and extract the image URL
      if (cloudinaryResponse.secure_url) {
        console.log("Upload file to Cloudinary!");
        const imageUrl = cloudinaryResponse.secure_url;
        console.log(imageUrl)

        // Set the image URL in the newEvent object
        event.image = imageUrl;
      } else {
        throw new Error("Unable to upload file to Cloudinary!");
      }
    }

    // Save the event
    await event.save();

    // Send the event notification asynchronously
    UPDATE_EVENT_NOTIFICATION(req, res, next)
      .then(() => {
        console.log("Update Notification sent successfully!");
      })
      .catch(error => {
        console.error("Error sending notification:", error);
      });

    res.status(200).json({success: true});
  } catch (validationError) {
    res.status(400).json({
      errors: {
        date: validationError.errors.date
          ? validationError.errors.date.message
          : "",
        link: validationError.errors.link
          ? validationError.errors.link.message
          : "",
      },
    });
  }
});



router.delete("/delete/:id", authenticateToken, isAdmin, async (req, res, next) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({error: "Event not found"});
    }

    if (event.image) {
      const publicIdMatch = event.image.match(/\/v\d+\/(.+)\./);
      const publicId = publicIdMatch ? publicIdMatch[1] : null;
      if (publicId) {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting image from Cloudinary:", error);
          } else {
            console.log("Image deleted from Cloudinary:", result);
          }
        });
      } else {
        console.log("Invalid image URL:", event.image);
      }
    }

    // Check if the event is upcoming or past
    const currentDate = DateTime.now();
    const eventDate = DateTime.fromISO(event.date);

    // If the event is upcoming, send a delete notification
    if (eventDate > currentDate) {
      DELETE_EVENT_NOTIFICATION(event)
        .then(() => {
          console.log("Delete Event Notification sent successfully!");
          // Once the notification is sent, delete the event
          event.deleteOne()
            .then(() => {
              console.log("Event deleted successfully!");
              res.status(200).json({success: true});
            })
            .catch(error => {
              console.error("Error deleting event:", error);
              res.status(500).json({error: "Server error"});
            });
        })
        .catch(error => {
          console.error("Error sending notification:", error);
          res.status(500).json({error: "Server error"});
        });
    } else {
      // If the event is past, delete the event without sending a notification
      event.deleteOne()
        .then(() => {
          console.log("Event deleted successfully!");
          res.status(200).json({success: true});
        })
        .catch(error => {
          console.error("Error deleting event:", error);
          res.status(500).json({error: "Server error"});
        });
    }
  } catch (error) {
    console.error("Error finding event:", error);
    res.status(500).json({error: "Server error"});
  }
});

module.exports = router;
