const mongoose = require("mongoose");
const {DateTime} = require("luxon");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const emailPattern =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\]^_`{|}~])(?=.{10,})/;
const contactNumberPattern =
  /^\+?\d{1,4}?[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$/;
const enumPattern = [
  "Please Select",
  "Other",
  "Avon",
  "Bedfordshire",
  "Alabama",
  "Arizona",
  "California",
  "Florida",
  "Illinois",
  "Massachusetts",
  "New York",
  "Ohio",
  "Texas",
  "Washington",
  "New South Wales",
  "Queensland",
  "South Australia",
  "Tasmania",
  "Victoria",
  "Western Australia",
  "Fukuoka",
  "Hiroshima",
  "Hokkaido",
  "Kanagawa",
  "Kyoto",
  "Nagoya",
  "Okinawa",
  "Osaka",
  "Saitama",
  "Tokyo",
];
const yearPattern = /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/;



const userSchema = new Schema({
  firstName: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  lastName: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  email: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
    validate: {
      validator: function (value) {
        return value.match(emailPattern);
      },
      message: "*Please enter a valid email address.*",
    },
    unique: true,
  },
  password: {
    type: String,
  },
  companyName: { type: String, required: false },
  jobs: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  contactNumber: {
    type: String,
    required: {
      value: true,
      message: "*Please enter a valid contact number.*",
    },
    validate: {
      validator: function (value) {
        return value.match(contactNumberPattern);
      },
      message:
        "*+ for international input. - or spaces between the numbers are accepted.*",
    },
  },
  address: { type: String, required: false },
  town: { type: String, required: false },
  country: {
    type: String,
    required: false,
    enum: enumPattern,
  },
  developmentTechnologist: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  course: {
    type: String,
  },
  year: {
    type: String,
  },
  agreement: {
    type: Boolean,
  },
  notification: {
    type: Boolean,
  },
  role: {
    type: String,
    default: "User",
  },
});


// // // // // Password // // // // //
userSchema.path("password").validate(function (value) {
  if (!value) {
    return this.invalidate("password", "*This is a required field.*");
  }
  return true;
});

// Define a virtual field for the plain-text password
userSchema
  .virtual("plainPassword")
  .set(function (value) {
    this._plainPassword = value;
  })
  .get(function () {
    return this._plainPassword;
  });

// Add a pre-save hook to hash the plain-text password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Add a validation for the plain-text password
userSchema.path("password").validate(function (value) {
  return passwordPattern.test(value);
}, "*Please enter a valid password.*");


// // // // // Course // // // // //
userSchema.path("course").validate(function (value) {
  if (this.developmentTechnologist === "Yes" && !value) {
    return this.invalidate("course", "*This is a required field.*");
  }
  return true;
});


// // // // // Year // // // // //
userSchema.path("year").validate(function (value) {
  if (this.developmentTechnologist === "Yes" && !value) {
    return this.invalidate("year", "*This is a required field.*");
  }
  if (this.developmentTechnologist === "Yes" && !value.match(yearPattern)) {
    return this.invalidate(
      "year",
      "*Please enter the year in the format of (dd/MM/yyyy).*"
    );
  }
  return true;
});

userSchema.pre("save", function (next) {
  // Check if the date field has been modified and is not empty
  if (this.isModified("year") && this.year !== "") {
    // Parse the date string and convert to UTC
    const dateObj = DateTime.fromFormat(this.year, "dd/MM/yyyy");
    this.year = dateObj.toUTC().toISODate();
  }
  next();
});


// // // // // Agreement // // // // //
userSchema.path("agreement").validate(function (value) {
  if (!value) {
    return this.invalidate(
      "agreement",
      "*Please agree to the terms and conditions to continue.*"
    );
  }
  return true;
});



const User = mongoose.model("User", userSchema);

module.exports = User;
