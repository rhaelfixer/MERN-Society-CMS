const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

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

const Affiliate = require("../models/affiliateSchema");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const sendAffiliateNotification = require("../middlewares/sendAffiliateNotification");
const updateAffiliateNotification = require("../middlewares/updateAffiliateNotification");
const sendTestEmail = require("../middlewares/sendTestEmail");

const SEND_AFFILIATE_NOTIFICATION = process.env.NODE_ENV === "production" ? sendAffiliateNotification : sendTestEmail;
const UPDATE_AFFILIATE_NOTIFICATION = process.env.NODE_ENV === "production" ? updateAffiliateNotification : sendTestEmail;



router.post("/create", authenticateToken, isAdmin, upload.single("image"), async (req, res, next) => {
  try {
    // Declare imageUrl variable outside the if statement
    let imageUrl = "";

    // Extract data from the request body
    const {title, date, description, link} = req.body;

    // Create the Affiliate
    const newAffiliate = new Affiliate({
      title,
      date,
      description,
      link,
      image: imageUrl,
    });

    // Validate the Affiliate object before saving
    try {
      await newAffiliate.validate();
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
        console.log("Upload file to Cloudinary");
        const imageUrl = cloudinaryResponse.secure_url;
        console.log(imageUrl)

        // Set the image URL in the Affiliate object
        newAffiliate.image = imageUrl;
      } else {
        throw new Error("Unable to upload file to Cloudinary");
      }
    }

    // Save the Affiliate
    await newAffiliate.save();

    // Send the Affiliate notification asynchronously
    SEND_AFFILIATE_NOTIFICATION(req, res, next)
      .then(() => {
        console.log("Affiliate Notification sent successfully!");
      })
      .catch(error => {
        console.error("Error sending Affiliate Notification:", error);
      });

    res.status(200).json({
      success: true,
      message: "Affiliate created successfully!",
      data: newAffiliate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Unable to create Affiliate!",
      errors: error,
    });
  }
});



router.get("/getAffiliate", async (req, res) => {
  try {
    const affiliate = await Affiliate.find().sort({date: -1});

    if (!affiliate) {
      return res.status(404).json({error: "Affiliate not found."});
    }

    res.status(200).json({affiliate});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});



router.get("/preview/:id", async (req, res, next) => {
  const {id} = req.params;
  try {
    // Find the Affiliate in the database by its id
    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({error: "Affiliate not found."});
    }

    if (affiliate.link) {
      // Fetch the HTML for the URL using axios
      const {data} = await axios.get(affiliate.link);

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
  const affiliateId = req.params.id;
  try {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({error: "Affiliate not found."});
    }

    // Only update the fields that are included in the request body
    if (req.body.title) {
      affiliate.title = req.body.title;
    }
    if (req.body.date) {
      affiliate.date = req.body.date;
    }
    if (req.body.description) {
      affiliate.description = req.body.description;
    }
    if (req.body.link) {
      affiliate.link = req.body.link;
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
        console.log("Upload file to Cloudinary");
        const imageUrl = cloudinaryResponse.secure_url;
        console.log(imageUrl)

        // Set the image URL in the Affiliate object
        affiliate.image = imageUrl;
      } else {
        throw new Error("Unable to upload file to Cloudinary");
      }
    }

    // Save the Affiliate
    await affiliate.save();

    // Send the Affiliate notification asynchronously
    UPDATE_AFFILIATE_NOTIFICATION(req, res, next)
      .then(() => {
        console.log("Updated Affiliate Notification sent successfully!");
      })
      .catch(error => {
        console.error("Error sending Update Affiliate Notification:", error);
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
  const affiliateId = req.params.id;
  try {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({error: "Affiliate not found"});
    }

    if (affiliate.image) {
      const publicIdMatch = affiliate.image.match(/\/v\d+\/(.+)\./);
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
        console.log("Invalid image URL:", affiliate.image);
      }
    }

    await affiliate.deleteOne()
      .then(() => {
        console.log("Affiliate deleted successfully!");
        res.status(200).json({success: true});
      })
      .catch(error => {
        console.error("Error deleting affiliate:", error);
        res.status(500).json({error: "Server error"});
      });

  } catch (error) {
    console.error("Error finding affiliate:", error);
    res.status(500).json({error: "Server error"});
  }
});

module.exports = router;
