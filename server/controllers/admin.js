const express = require("express");
const router = express.Router();

const User = require("../models/userSchema");
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");



router.get("/user", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.find({});

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    res.status(200).json({user});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});



router.put("/user", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Update all users with the new role
    const bulkUpdateOps = Object.keys(req.body.role).map((id) => ({
      updateOne: {
        filter: {_id: id},
        update: {$set: {role: req.body.role[id]}},
      },
    }));
    const updateResponse = await User.bulkWrite(bulkUpdateOps);

    if (!updateResponse || updateResponse.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        errors: {role: "*There are no changes made on the user's role.*"},
      });
    }

    res.status(200).json({success: true});
  } catch (error) {
    console.log(error);
    res.status(400).json({error: "Invalid data"});
  }
});

module.exports = router;
