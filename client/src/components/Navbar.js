import React, {useState, useEffect, useContext} from "react";
import "bootstrap/dist/css/bootstrap.css";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import axios from "axios";


// CSS
import "../pages/styles/Navbar.css";


// Images
import image from "../images/world-map.png";


// Authentication
import {AuthContext} from "./AuthContext";


// Server Status
import {useServerStatus} from "./ServerStatusContext";


const Navbar = () => {
  const [toggle, setToggle] = useState(true);
  const {isLoggedIn, logout} = useContext(AuthContext);
  const {username} = useContext(AuthContext);
  const {serverStatus, setServerStatus} = useServerStatus();

  const handleLogout = () => {
    logout();
  };


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/server-status` : `${ process.env.REACT_APP_BACKEND_DEV }/server-status`;

  useEffect(() => {
    // Make a GET request to Check if the Server is Online
    axios.get(API_URL)
      .then((response) => {
        if (response.status === 200) {
          setServerStatus("Online.");
        }
      })
      .catch((error) => {
        setServerStatus("Offline. Please wait for a while as it starts up.");
        console.error(error);
      });
  });

  return (
    <>
      <p className="p-CSS">
        {serverStatus !== "Checking Server Status..." ? `The Server is ${ serverStatus }` : "Checking Server Status..."}
      </p>
      <div className="row header-CSS">
        <div className="col-md-3">
          <Link
            to="/"
            onClick={() => {
              window.scrollTo({top: "0", behavior: "none"});
            }}
          >
            <img
              src={image}
              className="rounded mx-auto d-block navbar-logo-CSS"
              alt="world-map"
            />
          </Link>
        </div>
        <div className="col-md-9">
          <h3 className="h3-CSS">
            <Nav className="navbar" onClick={() => setToggle(!toggle)}>
              <Nav className={toggle ? "nav-menu" : "nav-menu active"}>
                <Link className="link-CSS" to="/">
                  Home
                </Link>
                <Link className="link-CSS" to="/about-us">
                  About Us
                </Link>
                <Link className="link-CSS" to="/event">
                  Event
                </Link>
                <Link className="link-CSS" to="/news">
                  News
                </Link>
                <Link className="link-CSS" to="/affiliate">
                  Affiliate
                </Link>
                {isLoggedIn ? (
                  <div>
                    <Link to={`/account/${ username }`}>
                      <Button className="button-CSS">
                        <h3 className="h3-CSS">Account</h3>
                      </Button>
                    </Link>
                    <Button className="button-CSS" onClick={handleLogout}>
                      <h3 className="h3-CSS">Log Out</h3>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Link to="/signup">
                      <Button className="button-CSS">
                        <h3 className="h3-CSS">Sign Up</h3>
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button className="button-CSS">
                        <h3 className="h3-CSS">Log In</h3>
                      </Button>
                    </Link>
                  </div>
                )}
              </Nav>
              <div
                onClick={() => setToggle(!toggle)}
                className={toggle ? "hamburger" : "hamburger active"}
              >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </div>
            </Nav>
          </h3>
        </div>
      </div>
    </>
  );
};

export default Navbar;
