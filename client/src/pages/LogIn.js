import React, {useState, useEffect, useContext, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Card, Form, InputGroup, Button} from "react-bootstrap";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillExclamationCircle,
} from "react-icons/ai";


// CSS
import "./styles/Login.css";


// Authentication
import {AuthContext} from "../components/AuthContext";
import setAuthToken from "../components/AuthToken";


const LogIn = () => {
  const {
    register,
    handleSubmit,
    formState,
    formState: {errors, isSubmitSuccessful},
    reset,
  } = useForm();
  const [showPassword, setShowPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {login} = useContext(AuthContext);
  const {username} = useContext(AuthContext);
  const navigate = useNavigate();
  const {resetToken} = useParams();
  console.log(errors);


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/sessions/login` : `${ process.env.REACT_APP_BACKEND_DEV }/sessions/login`;
  const Reset_API = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/reset/password` : `${ process.env.REACT_APP_BACKEND_DEV }/reset/password`;

  // Log In
  const onLogin = async (data) => {
    // Build the data object with data from form fields
    const payload = {
      email: data.email,
      password: data.password,
    };
    try {
      const response = await axios.post(API_URL, payload);
      if (!response.data.success) {
        setServerErrors(response.data.errors);
      } else {
        // Successful Response
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "success",
          title: "Welcome to the Society!",
          didClose: () => {
            window.scrollTo({top: 0, behavior: "instant"});
            navigate("/");
          },
        });
        setServerErrors({});
        login(response.data.token);
        if (rememberMe) {
          localStorage.setItem("email", data.email);
          localStorage.setItem("password", data.password);
          localStorage.setItem("rememberMe", true);
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
          localStorage.removeItem("rememberMe");
        }
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "error",
          title: "Please check your form again!",
          didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
        });
        setServerErrors(error.response.data.errors);
        console.log(error.response.data.errors);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful && !Object.keys(serverErrors).length) {
      reset();
    }
  }, [formState, isSubmitSuccessful, serverErrors, reset]);


  // Remember the Log In Credentials
  useEffect(() => {
    const storedRememberMe = localStorage.getItem("rememberMe");
    if (storedRememberMe) {
      setRememberMe(storedRememberMe === "true");
    }
  }, []);


  // Log In Page redirect to Account Page if the User is logged in
  const navigateToAccount = useCallback(() => {
    if (isLoggedIn) {
      navigate(`/account/${ username }`);
    }
  }, [isLoggedIn, navigate, username]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, [setIsLoggedIn]);

  useEffect(() => {
    navigateToAccount();
  }, [navigateToAccount]);


  // Forgot Password
  const handleForgotPassword = async () => {
    const {value: email} = await Swal.fire({
      title: "Input email address",
      input: "email",
      inputLabel: "Your Email Address",
      inputPlaceholder: "Enter your email address",
    });

    if (email) {
      try {
        const response = await axios.post(Reset_API, {
          email: email,
          resetToken: resetToken,
        });
        console.log(response.data);
        // Show a success message to the user
        Swal.fire({
          icon: "success",
          title: "Reset token sent!",
          text: `A reset link has been sent to ${ email }. Check your email and follow the instructions to reset your password.`,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Email doesn't exist!",
          text: `Please enter your email address again.`,
        });
      }
    }
  };

  return (
    <>
      <Form
        className="container-fluid container-login-CSS"
        onSubmit={handleSubmit(onLogin)}
        method="post"
      >
        <Card className="login-card-CSS">
          <Card.Body>
            <h1 className="h1-login-CSS">Welcome to MERN-Society-CMS Member</h1>
            <Form.Label className="login-label-CSS" htmlFor="email">
              Email:
            </Form.Label>
            <Form.Control
              className="login-text-CSS"
              name="email"
              type="text"
              placeholder="Email"
              defaultValue={localStorage.getItem("email") || ""}
              pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
              aria-invalid={
                errors.email || serverErrors.email ? "true" : "false"
              }
              {...register("email", {
                required: {
                  value: true,
                  message: "*Both email and password are required.*",
                },
                pattern: {
                  value:
                    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                  message: "*Invalid email or password.*",
                },
              })}
            />
            <br />
            <Form.Label className="login-label-CSS" htmlFor="password">
              Password:
            </Form.Label>
            <InputGroup>
              <Form.Control
                className="login-text-CSS"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                defaultValue={localStorage.getItem("password") || ""}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\d\s]).{10,}$"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password", {
                  required: {
                    value: true,
                    message: "*Both email and password are required.*",
                  },
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\]^_`{|}~])(?=.{10,})/,
                    message: "*Invalid email or password.*",
                  },
                })}
              />
              <InputGroup.Text>
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </InputGroup.Text>
            </InputGroup>

            {serverErrors.email || serverErrors.password ? (
              <>
                {serverErrors.email && (
                  <span className="login-error-message-CSS" role="alert">
                    {serverErrors.email}
                    <AiFillExclamationCircle className="alert-login-CSS" />
                  </span>
                )}
                {serverErrors.password && (
                  <span className="login-error-message-CSS" role="alert">
                    {serverErrors.password}
                    <AiFillExclamationCircle className="alert-login-CSS" />
                  </span>
                )}
              </>
            ) : (
              <>
                {errors.email || errors.password ? (
                  <span className="login-error-message-CSS" role="alert">
                    {errors.email && !errors.password && errors.email.message}
                    {errors.password &&
                      !errors.email &&
                      errors.password.message}
                    {errors.email &&
                      errors.password &&
                      "*Invalid email or password.*"}
                    <AiFillExclamationCircle className="alert-login-CSS" />
                  </span>
                ) : null}
              </>
            )}

            <br />
            <Button className="login-button-CSS" type="submit">
              Submit
            </Button>
            <div className="row extra-label-CSS">
              <Form.Check
                className="col-md-4 extra-text-CSS"
                name="agreement"
                type="checkbox"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <p
                className="col-md-4 extra-text-CSS forgot-swal-CSS"
                onClick={handleForgotPassword}
              >
                Forgot Password
              </p>
            </div>
            <h5>
              Not a member?{" "}
              <Link
                className="signup-link-CSS"
                to="/signup"
                onClick={() => {
                  window.scrollTo({top: "0", behavior: "none"});
                }}
              >
                Sign Up
              </Link>
              .
            </h5>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default LogIn;
