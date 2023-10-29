const bcrypt = require("bcrypt");
require("dotenv").config();



const adminData = [
  {
    firstName: "Super",
    lastName: "Admin",
    email: "admin@gmail.com",
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    companyName: "",
    jobs: "Chaiperson",
    contactNumber: "0123456789",
    address: "",
    town: "",
    country: "Please Select",
    developmentTechnologist: false,
    course: "",
    year: "",
    agreement: true,
    notification: false,
    role: "Admin",
  },
];



module.exports = adminData;
