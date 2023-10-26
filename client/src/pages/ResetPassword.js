import React, {useState, useEffect} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Card, Form, InputGroup, Button} from "react-bootstrap";
import {useNavigate, useParams} from "react-router-dom";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillExclamationCircle,
} from "react-icons/ai";


// CSS
import "./styles/ResetPassword.css";


// Authentication
import setAuthToken from "../components/AuthToken";


const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState,
    formState: {errors, isSubmitSuccessful},
    reset,
  } = useForm();
  const [showPassword, setShowPassword] = useState("");
  const [serverErrors, setServerErrors] = useState({});
  const navigate = useNavigate();
  const {resetToken} = useParams();
  console.log(errors);


  const Reset_API = process.env.NODE_ENV === "production"
    ? `${ process.env.REACT_APP_BACKEND_PROD }/reset/password/${ resetToken }`
    : `${ process.env.REACT_APP_BACKEND_DEV }/reset/password/${ resetToken }`;

  // Axios Submit Reset to Server
  const onReset = async (data) => {
    try {
      const decodedToken = jwt_decode(resetToken);
      // Build the data object with data from form fields
      const payload = {
        email: decodedToken.email,
        password: data.password,
        resetToken: resetToken,
      };
      const response = await axios.post(Reset_API, payload);
      if (!response.data.success) {
        setServerErrors(response.data.errors);
      } else {
        // Successful Response
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "success",
          title: "Continue to Log In Page!",
          didClose: () => {
            window.scrollTo({top: 0, behavior: "instant"});
            navigate("/login");
          },
        });
        setServerErrors({});
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "error",
          title: "Please check your input password again!",
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


  // Check if the Token is not expired
  useEffect(() => {
    const decodedToken = jwt_decode(resetToken);
    const now = new Date().getTime() / 1000;
    if (decodedToken.exp < now) {
      // If Token is expired, redirect to Login Page
      window.scrollTo({top: 0, behavior: "instant"});
      Swal.fire({
        icon: "error",
        title: "Password Reset Ticket Expired!",
        didClose: () => {
          window.scrollTo({top: 0, behavior: "instant"});
          navigate("/");
        },
      });
    }
  }, [resetToken, navigate]);


  // Reset Password Page redirect to Home Page if the User is logged in
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setAuthToken(token);
      navigate("/");
    }
  }, [navigate]);

  return (
    <Form
      className="container-fluid container-reset-CSS"
      onSubmit={handleSubmit(onReset)}
      method="post"
    >
      <Card className="reset-card-CSS">
        <Card.Body>
          <h1 className="h1-reset-CSS">Please enter your new password.</h1>
          <Form.Label className="reset-label-CSS" htmlFor="password">
            Password:
          </Form.Label>
          <InputGroup>
            <Form.Control
              className="reset-text-CSS"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\d\s]).{10,}$"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password", {
                required: {
                  value: true,
                  message: "*This is a required field.*",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\]^_`{|}~])(?=.{10,})/,
                  message: "*Please enter a valid password.*",
                },
              })}
            />
            <InputGroup.Text>
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </InputGroup.Text>
          </InputGroup>
          {errors.password ? (
            <span className="reset-error-message-CSS" role="alert">
              {errors.password.message}
              <AiFillExclamationCircle className="alert-reset-CSS" />
            </span>
          ) : serverErrors.password && (
            <span className="reset-error-message-CSS" role="alert">
              {serverErrors.password}
              <AiFillExclamationCircle className="alert-reset-CSS" />
            </span>
          )}
          <br />
          <Form.Text className="require-reset-password-CSS">
            <li>Uppercase Letters</li>
            <li>Lowercase Letters</li>
            <li>Symbols</li>
            <li>10+ Characters Length</li>
          </Form.Text>
          <Button className="reset-button-CSS" type="submit">
            Submit
          </Button>
        </Card.Body>
      </Card>
    </Form>
  );
};

export default ResetPassword;
