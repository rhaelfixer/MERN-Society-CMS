import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Link} from "react-router-dom";


// CSS
import "../pages/styles/Footer.css";


// Images
import image from "../images/world-map.png";


const Footer = () => (
  <>
    <div className="container-fluid row container-footer-CSS">
      <div className="col section1-footer-CSS">
        <Link
          className="footer-link-CSS"
          to="/"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          <img
            src={image}
            className="rounded mx-auto d-block footer-logo-CSS"
            alt="world-map"
          />
        </Link>
        <p className="footer-p-CSS">
          The MERN-Society-CMS allow admins to effortlessly manage events news and
          affiliates through seamless CRUD operations.
        </p>
      </div>
      <div className="col section2-footer-CSS">
        <h1 className="footer-h1-CSS">QUICK LINKS</h1>
        <Link
          className="footer-link-CSS"
          to="/"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          Home
        </Link>
        <Link
          className="footer-link-CSS"
          to="/about-us"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          About Us
        </Link>
        <Link
          className="footer-link-CSS"
          to="/event"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          Event
        </Link>
        <Link
          className="footer-link-CSS"
          to="/news"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          News
        </Link>
        <Link
          className="footer-link-CSS"
          to="/affiliate"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          Affiliate
        </Link>
        <Link
          className="footer-link-CSS"
          to="/terms-conditions"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          Terms & Conditions
        </Link>
      </div>
      <div className="col section3-footer-CSS">
        <h1 className="footer-h1-CSS">CONTACT DETAILS</h1>
        <h5 className="footer-contacts-CSS">
          For more information about the MERN-Society-CMS,
          Please contact Rhael Fixer, Software Developer on:
        </h5>
        <a
          className="footer-contacts-CSS"
          href="mailto:example@gmail.com"
        >
          &#9993; example@gmail.com &#9993;
        </a>
        <a className="footer-contacts-CSS" href="tel:+65 7751 1799">
          &#9742; +65 7751 1799 &#9742;
        </a>
      </div>
    </div>
    <div className="container-fluid row footer-bar-CSS">
      <p className="col footer-col1-CSS">
        Copyright &#169; {new Date().getFullYear()} Rhael Fixer
      </p>
      <p className="col footer-col2-CSS">
        <span role="img" aria-label="packages">
          🚚 📦 🏢 🎁 🚛
        </span>
      </p>
      <p className="col footer-col3-CSS">
        <Link
          className="footer-privacy-link-CSS"
          to="/privacy-policy"
          onClick={() => {
            window.scrollTo({top: "0", behavior: "none"});
          }}
        >
          Privacy Policy
        </Link>{" "}
        | Designed by Rhael Fixer.
      </p>
    </div>
  </>
);

export default Footer;
