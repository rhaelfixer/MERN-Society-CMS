import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import CookieConsent from "react-cookie-consent";
import {Routes, Route} from "react-router-dom";


// Authentication
import {AuthProvider} from "./components/AuthContext";


// Server Status
import {ServerStatusProvider} from "./components/ServerStatusContext";


// Routes
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Event from "./pages/Event";
import News from "./pages/News";
import Affiliate from "./pages/Affiliate";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import AdminControl from "./pages/AdminControl";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Footer from "./components/Footer";


function App() {
  const token = process.env.REACT_APP_TOKEN;
  const cookieKey = process.env.REACT_APP_COOKIE_KEY;
  const encryptedToken = CryptoJS.AES.encrypt(token, cookieKey).toString();

  return (
    <>
      <ServerStatusProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/event" element={<Event />} />
            <Route path="/news" element={<News />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/account/:id" element={<Account />} />
            <Route path="/admin/:adminToken" element={<AdminControl />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
          <Footer />
          <CookieConsent
            style={{fontSize: "20px", background: "#27709f"}}
            buttonStyle={{fontSize: "20px", color: "#4e503b"}}
            enableDeclineButton="true"
            onAccept={() => {
              Cookies.set(
                "MERN-Society-CMS",
                encryptedToken
              );
            }}
            onDecline={() => {
              Cookies.set(
                "MERN-Society-CMS",
                null
              );
            }}
          >
            We are using cookies to give you the best experience on our website.
          </CookieConsent>
        </AuthProvider>
      </ServerStatusProvider>
    </>
  );
}

export default App;
