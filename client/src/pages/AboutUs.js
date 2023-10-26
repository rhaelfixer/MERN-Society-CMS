import React, {useEffect, useContext} from "react";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";


// CSS
import "./styles/AboutUs.css";


// Images
import region from "../images/region.png";
import map from "../images/world-map.png";
import about from "../images/goals.png";
import economy from "../images/economy.png";


// Authentication
import {AuthContext} from "../components/AuthContext";


const AboutUs = () => {
  const {isLoggedIn} = useContext(AuthContext);
  const circleValues = [
    // United States
    {
      cx: -11.5, cy: 41, r: 7,
      link: "https://en.wikipedia.org/wiki/United_States"
    },
    // Australia
    {
      cx: 118.3, cy: 71.5, r: 7,
      link: "https://en.wikipedia.org/wiki/Australia"
    },
    // Japan
    {
      cx: 122, cy: 41, r: 7,
      link: "https://en.wikipedia.org/wiki/Japan"
    },
  ];


  useEffect(() => {
    const handleResize = () => {
      const svg = document.querySelector(".region-svg-CSS");
      const elements = document.querySelectorAll(".responsive-circle-CSS");

      // Get the dimensions of the SVG container
      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;

      elements.forEach((element, index) => {
        if (element.classList.contains("responsive-circle-CSS")) {
          const {cx, cy, r, link} = circleValues[index];

          const newCx = (cx / 100) * svgWidth;
          const newCy = (cy / 100) * svgHeight;
          const newR = (r / 100) * Math.min(svgWidth, svgHeight);

          element.style.setProperty("--cx", `${ newCx }px`);
          element.style.setProperty("--cy", `${ newCy }px`);
          element.style.setProperty("--r", `${ newR }px`);
          element.setAttribute("href", link);
        }
      });
    };

    // Attach the resize event listener
    window.addEventListener("resize", handleResize);

    // Call the initial resizing logic
    handleResize();

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [circleValues]);

  return (
    <>
      <div className="container-fluid container-about-CSS">
        <h1 className="about-h1-CSS">About MERN-Society-CMS</h1>
        <p className="about1-p-CSS">
          The MERN-Society-CMS allow admins to effortlessly manage events news and
          affiliates through seamless CRUD operations.
        </p>
      </div>

      <section className="container-fluid row section1-about-CSS">
        <div className="col-xxl-5 region-container-CSS">
          <img
            className="img-fluid mx-auto d-block region-img-CSS"
            src={region}
            alt="region"
          />
          <svg
            className="region-svg-CSS"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
          >
            {circleValues.map((circle, index) => (
              <a
                href={circle.link}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
              >
                <circle
                  className={`region-circle-${ index + 1 }-CSS responsive-circle-CSS`}
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                />
              </a>
            ))}
          </svg>
        </div>
        <div className="col-xxl-5 about-society-CSS">
          <p className="about2-p-CSS">
            We are an international society committed to supporting professionals from
            various fields around the world.
          </p>
          <p className="about2-p-CSS">
            We link professionals in development, design, manufacture,
            retail, sustainability and recovery to promote the
            sharing of knowledge and best practice across all industry sectors.
          </p>
          <p className="about2-p-CSS">
            Our aim is to promote learning and knowledge development through
            networking, conferences, supplier visits, talks and webinars.
          </p>
          {isLoggedIn ? (
            <Link
              to="/events"
              onClick={() => {
                window.scrollTo({top: "0", behavior: "none"});
              }}
            >
              <Button className="member-event-button-CSS">
                <h3 className="member-event-text-CSS">
                  Explore our Events ➤
                </h3>
              </Button>
            </Link>
          ) : (
            <Link
              to="/signup"
              onClick={() => {
                window.scrollTo({top: "0", behavior: "none"});
              }}
            >
              <Button className="member-event-button-CSS">
                <h3 className="member-event-text-CSS">
                  Become a Member Today ➤
                </h3>
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section className="container-fluid row section2-about-CSS">
        <h2 className="about-h2-CSS">Our History</h2>
        <div className="col-md-5">
          <p className="about3-p-CSS">
            The society collaborates with its affiliated regional communities and has
            a rich history dating back to its predecessor. It is connected to a global
            network of professionals spanning a diverse range of industries, offering
            support to its members and the broader professional community for over 75
            years.
          </p>
          <p className="about3-p-CSS">
            From an international perspective, the MERN-Society-CMS represents a
            culmination of experience and expertise from various organizations.
            Together, it forms a powerful force in its respective field, benefiting
            both members and the wider society.
          </p>
        </div>
        <div className="col-md-5">
          <img
            className="img-fluid rounded mx-auto d-block map-img-CSS"
            src={map}
            alt="map"
          />
        </div>
      </section>

      <section className="container-fluid row section3-about-CSS">
        <h2 className="about-h2-CSS">What we do</h2>
        <div className="col-md-5">
          <img
            className="img-fluid rounded mx-auto d-block about-img-CSS"
            src={about}
            alt="about"
          />
        </div>
        <div className="col-md-5">
          <h5 className="about-h5-1-CSS">
            We offer support and advice.
          </h5>
          <p className="about4-p-CSS">
            Globally, government interventions into various industries are
            unprecedented, with legislation addressing issues such as the Plastic
            Tax, Extended Producer Responsibility (EPR), Deposit Return Scheme
            (DRS), carbon emission reductions, greenwashing and product labeling.
            Example: Compostable materials are part of the drive to better design for
            the future in a circular economy and reduce waste.
          </p>
          <h5 className="about-h5-2-CSS">
            We are here to provide objective information.
          </h5>
        </div>
      </section>

      <section className="container-fluid row section4-about-CSS">
        <div className="col-lg-5 display1-about-img2-CSS">
          <img
            className="img-fluid mx-auto d-block about-benefits-img-CSS"
            src={economy}
            alt="economy"
          />
        </div>
        <div className="col-lg-5">
          <h1 className="about-society-h1-CSS">
            We promote the science, technology benefits of materials and
            components, including supply chain processes, across various industries.
          </h1>
        </div>
        <div className="col-md-5 display2-about-img2-CSS">
          <img
            className="img-fluid mx-auto d-block about-benefits-img-CSS"
            src={economy}
            alt="economy"
          />
        </div>
      </section>
    </>
  );
};

export default AboutUs;
