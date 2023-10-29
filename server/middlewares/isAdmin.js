const User = require("../models/userSchema.js");



// Check if User is Admin
const isAdmin = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: err,
    });
  }
};

module.exports = isAdmin;
