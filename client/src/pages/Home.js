import React, {useContext} from "react";
import "bootstrap/dist/css/bootstrap.css";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import "animate.css";
import {AnimationOnScroll} from "react-animation-on-scroll";
import Carousel from "react-bootstrap/Carousel";


// CSS
import "./styles/Home.css";


// Images
import intro from "../images/world-map.png";
import aim from "../images/aim.png";
import training from "../images/training.png";
import carousel1 from "../images/plan.png";
import carousel2 from "../images/design.png";
import carousel3 from "../images/bottles.png";
import carousel4 from "../images/shelf.png";
import carousel5 from "../images/port.png";
import carousel6 from "../images/recycle.png";
import carousel7 from "../images/global.png";
import objectives from "../images/objectives.png";


// Authentication
import {AuthContext} from "../components/AuthContext";


const Home = () => {
  const {isLoggedIn} = useContext(AuthContext);

  return (
    <>
      <div className="container-fluid row container-home-CSS fade-in-zoom-in-CSS">
        <div className="col-md-5">
          <h1 className="welcome-CSS">The MERN-Society-CMS</h1>
          <p className="home-p-CSS">
            We are an international society committed to supporting professionals from
            various fields around the world.
          </p>
          <p className="home-p-CSS">
            To help you share knowledge and offering networking opportunities.
          </p>
        </div>
        <div className="col-md-5">
          <img
            className="img-fluid rounded mx-auto d-block society-img-CSS"
            src={intro}
            alt="society"
          />
        </div>
      </div>

      <svg
        style={{
          transform: "rotate(0deg)",
          transition: "0.3s",
          position: "relative",
          zIndex: "1",
        }}
        version="1.1"
        viewBox="0 0 1440 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="b" x2="0" y1="1">
            <stop stopColor="rgba(62, 152, 210, 1)" offset="0" />
            <stop stopColor="rgba(62, 152, 210, 1)" offset="1" />
          </linearGradient>
        </defs>
        <path
          d="m0 60 40-8.3c40-8.7 120-24.7 200-21.7s160 27 240 31.7c80 5.3 160-8.7 240-11.7s160 3 240 8.3c80 4.7 160 8.7 240 1.7s160-23 240-23.3c80 0.3 160 16.3 240 23.3s160 3 240-5 160-22 240-28.3c80-6.7 160-6.7 240-6.7h240 240c80 0 160 0 240 10s160 30 240 26.7c80-3.7 160-29.7 240-43.4 80-13.3 160-13.3 240 1.7s160 45 240 58.3c80 13.7 160 9.7 240 1.7s160-22 240-33.3c80-11.7 160-21.7 240-18.4 80 3.7 160 19.7 240 21.7s160-12 240-8.3c80 3.3 160 23.3 240 20 80-3.7 160-29.7 200-43.4l40-13.3v100h-40-200-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-200-40z"
          fill="url(#b)"
          style={{
            transform: "translate(0, 0px)",
            position: "relative",
            zIndex: "1",
          }}
        />
        <defs>
          <linearGradient id="a" x2="0" y1="1">
            <stop stopColor="rgba(39, 112, 159, 1)" offset="0" />
            <stop stopColor="rgba(39, 112, 159, 1)" offset="1" />
          </linearGradient>
        </defs>
        <path
          d="m0 20 40 5c40 5 120 15 200 11.7 80-3.7 160-19.7 240-20 80 0.3 160 16.3 240 16.6 80-0.3 160-16.3 240-23.3s160-3 240 6.7c80 10.3 160 26.3 240 28.3s160-12 240-21.7c80-10.3 160-16.3 240-6.6 80 10.3 160 36.3 240 50 80 13.3 160 13.3 240 8.3s160-15 240-20 160-5 240-3.3c80 1.3 160 5.3 240 3.3s160-8 240-3.3c80 5.3 160 21.3 240 28.3s160 3 240-11.7c80-15.3 160-41.3 240-46.6 80-4.7 160 11.3 240 25 80 13.3 160 23.3 240 28.3s160 5 240 5 160 0 240-5 160-15 240-15 160 10 240 16.7c80 6.3 160 10.3 200 11.6l40 1.7v10h-40-200-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-240-200-40z"
          fill="url(#a)"
          opacity=".9"
          style={{
            transform: "translate(0, 50px)",
            position: "relative",
            zIndex: "1",
          }}
        />
      </svg>

      <section className="container-fluid section1-home-CSS">
        <AnimationOnScroll
          animateIn="animate__fadeInDown"
          animateOnce="true"
          duration="2"
        >
          <div className="section1-1-home-CSS">
            <h1 className="intro-h1-CSS">The MERN-Society-CMS</h1>
            <p className="intro-p-CSS">
              The MERN-Society-CMS allow admins to effortlessly manage events, news
              and affiliates through seamless CRUD operations.
            </p>
            <p className="intro-p-CSS">
              We provide assistance to a worldwide technical community.
            </p>
            <p className="intro-p-CSS">
              We link professionals in development, design, manufacture,
              retail, sustainability and recovery to promote the
              sharing of knowledge and best practice across all industry sectors.
            </p>
          </div>
        </AnimationOnScroll>
        <AnimationOnScroll
          animateIn="animate__fadeIn"
          animateOnce="true"
          duration="2"
          delay="1000"
        >
          <div className="section1-2-home-CSS">
            <Link
              to="/about-us"
              onClick={() => {
                window.scrollTo({top: "0", behavior: "none"});
              }}
            >
              <Button className="know-more-button-CSS">
                <h3 className="know-more-CSS">Know More ➤</h3>
              </Button>
            </Link>
          </div>
        </AnimationOnScroll>
      </section>

      <section className="container-fluid row section2-home-CSS">
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInLeft"
            animateOnce="true"
            duration="2"
          >
            <img
              className="img-fluid rounded mx-auto d-block aim-img-CSS"
              src={aim}
              alt="aim"
            />
          </AnimationOnScroll>
        </div>
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInRight"
            animateOnce="true"
            duration="2"
          >
            <h1 className="aim-h1-CSS">Our Aim</h1>
            <ul className="aim-ul-CSS">
              <li>
                To promote the science, technology and benefits of materials for
                various industries in a sustainable economy.
              </li>
              <li>
                Arrange webinars, conferences, meetings, factory visits and other
                events for professional development and networking.
              </li>
              <li>Encourage careers in any industry.</li>
              <li>
                Promote training programs on various business-related topics.
              </li>
            </ul>
          </AnimationOnScroll>
        </div>
      </section>

      <section className="container-fluid row section3-home-CSS">
        <AnimationOnScroll
          animateIn="animate__bounce"
          animateOnce="true"
          duration="2"
        >
          <h1 className="mern-h1-CSS">
            Benefits of being part of the MERN-Society-CMS
          </h1>
        </AnimationOnScroll>
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInLeft"
            animateOnce="true"
            duration="2"
          >
            <ul className="mern-ul-CSS">
              <li className="mern-li-CSS">
                Broaden knowledge – the opportunity to expand your knowledge through
                courses, webinars and Face to Face events to keep you up to date on
                the latest industry innovations research and trends.
              </li>
              <li className="mern-li-CSS">
                Our enhanced network enables countless opportunities to connect locally
                and globally.
              </li>
              <li className="mern-li-CSS">
                Opportunities to become more involved as a volunteer in local,
                professional and technical activities.
              </li>
              <li className="mern-li-CSS">
                Discounted rates at our and other associated events.
              </li>
            </ul>
          </AnimationOnScroll>
        </div>
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInRight"
            animateOnce="true"
            duration="2"
          >
            <img
              className="img-fluid rounded mx-auto d-block home-training-img-CSS"
              src={training}
              alt="training"
            />
          </AnimationOnScroll>
        </div>
        <Carousel className="carousel-CSS" variant="dark" interval={2500}>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel1}
              alt="carousel1"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel2}
              alt="carousel2"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel3}
              alt="carousel3"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel4}
              alt="carousel4"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel5}
              alt="carousel5"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel6}
              alt="carousel6"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="img-fluid rounded mx-auto d-block carousel-img-CSS"
              src={carousel7}
              alt="carousel7"
            />
          </Carousel.Item>
        </Carousel>
      </section>

      <section className="container-fluid row section4-home-CSS">
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInLeft"
            animateOnce="true"
            duration="2"
          >
            <img
              className="img-fluid rounded mx-auto d-block objectives-img-CSS"
              src={objectives}
              alt="objectives"
            />
          </AnimationOnScroll>
        </div>
        <div className="col-md-5">
          <AnimationOnScroll
            animateIn="animate__fadeInRight"
            animateOnce="true"
            duration="2"
          >
            <h1 className="objectives-h1-CSS">What we do</h1>
            <h5 className="objectives-h5-CSS">
              We offer support and advice.
            </h5>
            <p className="objectives-p-CSS">
              Globally, government interventions into various industries are
              unprecedented, with legislation addressing issues such as the Plastic
              Tax, Extended Producer Responsibility (EPR), Deposit Return Scheme
              (DRS), carbon emission reductions, greenwashing and product labeling.
            </p>
            <p className="objectives-p-CSS">
              Advice seems to be everywhere - do use or don’t use some materials e.g.
              paper vs plastic or alternatives e.g. compostable and of course, the
              drive to better design for the future in a circular economy and reduce
              waste.
            </p>
            <h5 className="objectives-h5-CSS">
              We are here to provide objective information.
            </h5>
            {isLoggedIn ? (
              <Link
                to="/events"
                onClick={() => {
                  window.scrollTo({top: "0", behavior: "none"});
                }}
              >
                <Button className="sign-event-button-CSS">
                  <h3 className="sign-event-text-CSS">
                    Check Out our Events ➤
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
                <Button className="sign-event-button-CSS">
                  <h3 className="sign-event-text-CSS">
                    Join Today for FREE ➤
                  </h3>
                </Button>
              </Link>
            )}
          </AnimationOnScroll>
        </div>
      </section>
    </>
  );
};

export default Home;
