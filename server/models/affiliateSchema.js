const mongoose = require("mongoose");
const {DateTime} = require("luxon");
const Schema = mongoose.Schema;

const datePattern = /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/;
const linkValidator = [
  (value) => {
    if (value && value.trim() !== '') {
      return {
        validator: "isURL",
        message: "*Please enter a valid URL.*",
        protocols: ["http", "https", "ftp"],
        require_tld: true,
        require_protocol: true,
        regex: /^(https?|ftp):\/\/([^\s/?.#-]+-?[^\s/?.#-]*\.?)+(\/[^\s]*)?$/i,
      };
    }
    return true; // Allow Empty Values
  },
];



const affiliateSchema = new Schema({
  title: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  date: {
    type: String,
  },
  description: {
    type: String,
    required: {
      value: true,
      message: "*This is a required field.*",
    },
  },
  link: {
    type: String,
    required: false,
    validate: linkValidator,
  },
  image: {
    type: String,
    required: false
  }
});


// // // // // Date // // // // //
affiliateSchema.path("date").validate(function (value) {
  if (!value) {
    return this.invalidate("date", "*This is a required field.*");
  }
  if (!value.match(datePattern)) {
    return this.invalidate(
      "date",
      "*Please enter the date in the format of (dd/MM/yyyy).*"
    );
  }
  return true;
});

affiliateSchema.pre("save", function (next) {
  // Check if the date field has been modified
  if (this.isModified("date")) {
    // Parse the date string and convert to UTC
    const dateObj = DateTime.fromFormat(this.date, "dd/MM/yyyy", {zone: "utc"});
    // Convert the date object to an ISO-formatted date string in UTC
    this.date = dateObj.toISODate({zone: "utc"});
  }
  next();
});



const Affiliate = mongoose.model("Affiliate", affiliateSchema);

module.exports = Affiliate;
