//___________________
// Dependencies
//___________________
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBSession = require("connect-mongodb-session")(session);
const cors = require("cors");
const app = express();
const seedData = require("./controllers/seed");
require("dotenv").config();



//___________________
// Port
//___________________
const PORT = process.env.PORT || "server";
const MONGODB_URL = process.env.NODE_ENV === "production" ? process.env.MONGODB_PRODUCTION : process.env.MONGODB_DEVELOPMENT;
console.log(MONGODB_URL);
const corsOption = {
  origin: "*",
};


mongoose.set("strictQuery", false);
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.once("open", () => {
  console.log("Server: Connected");
});
db.on("error", () => {
  console.log("Server: Connection Error");
});


const mongoDBStore = new MongoDBSession({
  uri: MONGODB_URL,
  collection: "sessions",
});



//___________________
// Middleware
//___________________
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});
app.use(
  session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoDBStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "lax",
    },
  })
);


const userController = require("./controllers/users.js");
const sessionsController = require("./controllers/sessions.js");
const accountController = require("./controllers/account.js");
const adminController = require("./controllers/admin.js");
const resetController = require("./controllers/reset.js");
const eventController = require("./controllers/event.js");
const newsController = require("./controllers/news.js");
const affiliateController = require("./controllers/affiliate.js");


app.use("/users", userController);
app.use("/sessions", sessionsController);
app.use("/account", accountController);
app.use("/admin", adminController);
app.use("/reset", resetController);
app.use("/event", eventController);
app.use("/news", newsController);
app.use("/affiliate", affiliateController);



// Server Status
app.get("/server-status", (req, res) => {
  res.status(200).send("System Online and Operational.");
  console.log("System Online and Operational.");
});


// Set Session Data
app.post("/set-session", (req, res) => {
  const { userId, userRole } = req.body;
  req.session.userId = userId;
  req.session.role = userRole;
  res.send({ message: "Session data set successfully." });
});


// Remove Session Data
app.delete("/remove-session", (req, res) => {
  const sessionId = req.params.sessionId;
  mongoDBStore.destroy(sessionId, (err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send({ message: "Error deleting session!" });
    }
    res.send({ message: "Session data removed successfully." });
  });
});


// Make the App listen on PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


seedData();
