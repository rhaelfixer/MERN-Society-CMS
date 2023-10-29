const MongoClient = require("mongodb").MongoClient;
const User = require("../models/userSchema");
const adminData = require("../models/seedAdmin");
require("dotenv").config();

const MONGODB_URL = process.env.NODE_ENV === "production" ? process.env.MONGODB_PRODUCTION : process.env.MONGODB_DEVELOPMENT;
const dbName = process.env.DATABASE_NAME;
const seededFlagKey = "dataSeeded";



const seedData = async () => {
  let client;
  try {
    // Establish a connection to the database
    client = await MongoClient.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    const collection = db.collection("metadata");
    const seeded = await collection.findOne({key: seededFlagKey});

    // Check if data has already been seeded
    if (!seeded || !seeded.value) {
      // Data has not been seeded yet, so insert the data
      await User.insertMany(adminData);
      console.log("Data successfully seeded!");

      // Set the seeded flag to true
      await collection.updateOne(
        {key: seededFlagKey},
        {$set: {value: true}},
        {upsert: true}
      );
    } else {
      console.log("Data already seeded, skipping...");
    }
  } catch (err) {
    console.error(err);
  } finally {
    // Close the database connection
    if (client) {
      client.close();
    }
  }
};

module.exports = seedData;
