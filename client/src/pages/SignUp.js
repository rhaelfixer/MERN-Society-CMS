import React, {useState, useEffect} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Form, InputGroup, Button} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillExclamationCircle,
} from "react-icons/ai";


// CSS
import "./styles/SignUp.css";


// Authentication
import setAuthToken from "../components/AuthToken";


const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState,
    formState: {errors, isSubmitSuccessful},
    reset,
  } = useForm();
  const [showPassword, setShowPassword] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [check, setCheck] = useState(false);
  const [check1, setCheck1] = useState("");
  const [check2, setCheck2] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const navigate = useNavigate();
  console.log(errors);


  useEffect(() => {
    if (check === false) {
      // Check === False (Default Selected: "No")
      // This will set the input fields to not be required
      setIsRequired(false);
      setCheck1(
        <>
          <br />
          <Form.Group className="form-CSS">
            <Form.Label className="radio-label-CSS" htmlFor="course">
              Where did you complete the course?{" "}
              <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              id="course"
              className="radio-text-CSS"
              name="course"
              type="text"
              placeholder="Course Completion"
              aria-invalid={errors.course ? "true" : "false"}
              {...register("course", {
                required: isRequired,
              })}
            />
          </Form.Group>
        </>
      );
      setCheck2(
        <>
          <br />
          <Form.Group className="form-CSS">
            <Form.Label className="radio-label-CSS" htmlFor="year">
              In what year did you qualify:{" "}
              <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              id="year"
              className="radio-text-CSS"
              name="year"
              type="text"
              placeholder="Year of Qualification"
              aria-invalid={errors.year ? "true" : "false"}
              {...register("year", {
                required: isRequired,
              })}
            />
            <Form.Text>
              <p className="require-date-CSS">Accepted Date Format: dd/MM/yyyy</p>
            </Form.Text>
          </Form.Group>
        </>
      );
    } else {
      // Check === True (User Selected: "Yes")
      // This will set the input fields to be required
      setIsRequired(true);
      setCheck1(
        <>
          <br />
          <Form.Group className="form-CSS">
            <Form.Label className="radio-label-CSS" htmlFor="course">
              Where did you complete the course?{" "}
              <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              id="course"
              className="radio-text-CSS"
              name="course"
              type="text"
              placeholder="Course Completion"
              aria-invalid={errors.course ? "true" : "false"}
              {...register("course", {
                required: isRequired
                  ? {
                    value: true,
                    message: "*This is a required field.*",
                  }
                  : false,
              })}
            />
          </Form.Group>
        </>
      );
      setCheck2(
        <>
          <br />
          <Form.Group className="form-CSS">
            <Form.Label className="radio-label-CSS" htmlFor="year">
              In what year did you qualify:{" "}
              <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              id="year"
              className="radio-text-CSS"
              name="year"
              type="text"
              placeholder="Year of Qualification"
              pattern="^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$"
              aria-invalid={errors.year ? "true" : "false"}
              {...register("year", {
                required: isRequired
                  ? {
                    value: true,
                    message: "*This is a required field.*",
                  }
                  : false,
                pattern: {
                  value: /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/,
                  message:
                    "*Please enter the year in the format of (dd/MM/yyyy).*",
                },
              })}
            />
            <Form.Text>
              <p className="require-date-CSS">Accepted Date Format: dd/MM/yyyy</p>
            </Form.Text>
          </Form.Group>
        </>
      );
    }
  }, [check, isRequired, errors, register]);

  // If Check === True, else Hide the Text.
  useEffect(() => {
    const hideOption = document.getElementById("hideOption");
    const courseInput = document.getElementById("course");
    const yearInput = document.getElementById("year");

    hideOption.style.visibility = check === false ? "hidden" : "visible";

    if (check) {
      if (courseInput) {
        courseInput.value = "";
      }
      if (yearInput) {
        yearInput.value = "";
      }
    }
  }, [check]);


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/users/signup` : `${ process.env.REACT_APP_BACKEND_DEV }/users/signup`;

  // Axios Submit Form to Server
  const onSubmit = async (data) => {
    // Clear the input values when switching from "Yes" to "No" after typing.
    // For instance, if the user initially enter the data in the "course" and
    // "year" input fields but then decides not to provide this information by
    // selecting "No", the input values are automatically cleared, ensuring no
    // unwanted data is sent to the server.
    if (check === false) {
      data.course = "";
      data.year = "";
    }

    // Build the data object with data from form fields
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      jobs: data.jobs,
      contactNumber: data.contactNumber,
      address: data.address,
      town: data.town,
      country: data.country,
      developmentTechnologist: data.developmentTechnologist,
      course: data.course,
      year: data.year,
      agreement: data.agreement,
      notification: data.notification,
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
          didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
        });
        reset();
        setCheck(false);
        setServerErrors({});
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


  // Sign Up Page redirect to Account Page if the User is logged in
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setAuthToken(token);
      navigate("/account");
    }
  }, [navigate]);

  const CountryList = [
    {value: "Please Select", label: "Please Select"},
    {value: "Other", label: "Other"},
  ];
  const UnitedStatesRegion = [
    {value: "Alabama", label: "Alabama"},
    {value: "Arizona", label: "Arizona"},
    {value: "California", label: "California"},
    {value: "Florida", label: "Florida"},
    {value: "Illinois", label: "Illinois"},
    {value: "Massachusetts ", label: "Massachusetts"},
    {value: "New York", label: "New York"},
    {value: "Ohio", label: "Ohio"},
    {value: "Texas", label: "Texas"},
    {value: "Washington", label: "Washington"},
  ];
  const AustraliaRegion = [
    {value: "New South Wales", label: "New South Wales"},
    {value: "Queensland", label: "Queensland"},
    {value: "South Australia", label: "South Australia"},
    {value: "Tasmania", label: "Tasmania"},
    {value: "Victoria", label: "Victoria"},
    {value: "Western Australia", label: "Western Australia"},
  ];
  const JapanRegion = [
    {value: "Fukuoka", label: "Fukuoka"},
    {value: "Hiroshima", label: "Hiroshima"},
    {value: "Hokkaido", label: "Hokkaido"},
    {value: "Kanagawa", label: "Kanagawa"},
    {value: "Kyoto", label: "Kyoto"},
    {value: "Nagoya", label: "Nagoya"},
    {value: "Okinawa", label: "Okinawa"},
    {value: "Osaka", label: "Osaka"},
    {value: "Saitama", label: "Saitama"},
    {value: "Tokyo", label: "Tokyo"},
  ];

  return (
    <>
      <div className="container-fluid row container-signup-CSS">
        <h1 className="register-form-CSS">MERN-Society-CMS Registration Form</h1>
        <p className="register-text-CSS">
          Fields marked with an <span className="symbol-CSS">*</span> are required.
        </p>
        <Form
          className="col-md-5 section1-register-CSS"
          onSubmit={handleSubmit(onSubmit)}
          method="post"
        >
          <Form.Group className="form-CSS">
            <Form.Label className="input-label-CSS" htmlFor="firstName">
              First Name: <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              name="firstName"
              type="text"
              placeholder="First Name"
              aria-invalid={errors.firstName ? "true" : "false"}
              {...register("firstName", {
                required: {
                  value: true,
                  message: "*This is a required field.*",
                },
              })}
            />
            <br />
            {errors.firstName && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {errors.firstName.message}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            {serverErrors.firstName && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {serverErrors.firstName}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            <br />
            <br />
            <Form.Label className="input-label-CSS" htmlFor="lastName">
              Last Name: <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              name="lastName"
              type="text"
              placeholder="Last Name"
              aria-invalid={errors.lastName ? "true" : "false"}
              {...register("lastName", {
                required: {
                  value: true,
                  message: "*This is a required field.*",
                },
              })}
            />
            <br />
            {errors.lastName && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {errors.lastName.message}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            {serverErrors.lastName && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {serverErrors.lastName}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            <br />
            <br />
            <Form.Label className="input-label-CSS" htmlFor="email">
              Email: <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              name="email"
              type="email"
              placeholder="Email"
              pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
              aria-invalid={
                errors.email || serverErrors.email ? "true" : "false"
              }
              {...register("email", {
                required: {
                  value: true,
                  message: "*This is a required field.*",
                },
                pattern: {
                  value:
                    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                  message: "*Please enter a valid email address.*",
                },
              })}
            />
            <br />
            {errors.email ? (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {errors.email.message}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            ) : serverErrors.email && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {serverErrors.email}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            <br />
            <br />
            <Form.Label className="input-label-CSS" htmlFor="password">
              Password: <span className="symbol-CSS">*</span>
            </Form.Label>
            <InputGroup className="input-text-CSS">
              <Form.Control
                className="input-text-CSS"
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
            <Form.Group className="row">
              <Form.Text className="col-md-4 require-password-CSS">
                <li>Uppercase Letters</li>
                <li>Lowercase Letters</li>
                <li>Symbols</li>
                <li>10+ Characters Length</li>
              </Form.Text>
              <div className="col-md-6">
                {errors.password ? (
                  <span className="span-2-CSS symbol-CSS" role="alert">
                    {errors.password.message}
                    <AiFillExclamationCircle className="alert-sign-CSS" />
                  </span>
                ) : serverErrors.password && (
                  <span className="span-2-CSS symbol-CSS" role="alert">
                    {serverErrors.password}
                    <AiFillExclamationCircle className="alert-sign-CSS" />
                  </span>
                )}
              </div>
            </Form.Group>
            <br />
            <Form.Label className="input-label-CSS" htmlFor="companyName">
              Company Name:
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              type="text"
              placeholder="Company Name"
              {...register("companyName", {required: false})}
            />
            <br />
            <br />
            <br />
            <Form.Label className="input-label-CSS" htmlFor="jobs">
              Job Role / Position: <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              name="jobs"
              type="text"
              placeholder="Job Role / Position"
              aria-invalid={errors.jobs ? "true" : "false"}
              {...register("jobs", {
                required: {
                  value: true,
                  message: "*This is a required field.*",
                },
              })}
            />
            <br />
            {errors.jobs && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {errors.jobs.message}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            {serverErrors.jobs && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {serverErrors.jobs}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            <br />
            <br />
            <Form.Label className="input-label-CSS" htmlFor="contactNumber">
              Contact Number: <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Control
              className="input-text-CSS"
              name="contactNumber"
              type="tel"
              placeholder="Contact Number"
              pattern="^\+?\d{1,4}?[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$"
              aria-invalid={errors.contactNumber ? "true" : "false"}
              {...register("contactNumber", {
                required: {
                  value: true,
                  message: "*Please enter a valid contact number.*",
                },
                pattern: {
                  value:
                    /^\+?\d{1,4}?[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$/,
                  message:
                    "*+ for international input. - or spaces between the numbers are accepted.*",
                },
              })}
            />
            <br />
            {errors.contactNumber ? (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {errors.contactNumber.message}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            ) : serverErrors.contactNumber && (
              <span className="span-1-CSS symbol-CSS" role="alert">
                {serverErrors.contactNumber}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}
            <br />
            <br />
            <Form.Label className="input-label-CSS">Address:</Form.Label>
            <Form.Control
              className="input-text-CSS"
              type="text"
              placeholder="Address"
              {...register("address", {required: false})}
            />
            <br />
            <br />
            <br />
            <Form.Label className="input-label-CSS">Town:</Form.Label>
            <Form.Control
              className="input-text-CSS"
              type="text"
              placeholder="Town"
              {...register("town", {required: false})}
            />
          </Form.Group>
          <br />
          <br />
          <br />
          <Form.Group className="form-CSS">
            <Form.Label className="input-label-CSS" htmlFor="country">
              Country:
            </Form.Label>
            <Form.Select
              className="input-select-CSS"
              name="country"
              options={selectedOption}
              onChange={(option) => setSelectedOption(option)}
              aria-invalid={errors.country ? "true" : "false"}
              {...register("country", {required: false})}
            >
              {CountryList.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <optgroup label="United States Region">
                {UnitedStatesRegion.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Australia Region">
                {AustraliaRegion.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Japan Region">
                {JapanRegion.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            </Form.Select>
            <br />
            <br />
          </Form.Group>
          <Form.Group className="row form-css">
            <Form.Label className="p-label-radio-CSS">
              Are you a qualified Product Development Technologist{" "}
              <span className="symbol-CSS">*</span>
            </Form.Label>
            <Form.Check
              className="col radio-check-CSS"
              name="developmentTechnologist"
              type="radio"
              label="Yes"
              value="Yes"
              checked={check}
              {...register("developmentTechnologist", {
                required: true,
                onChange: (e) => setCheck(!check),
              })}
            />

            <Form.Check
              className="col radio-check-CSS"
              name="developmentTechnologist"
              type="radio"
              label="No"
              value="No"
              checked={!check}
              {...register("developmentTechnologist", {
                required: true,
                onChange: (e) => setCheck(!check),
              })}
            />
            {serverErrors.developmentTechnologist && (
              <span className="span-3-CSS symbol-CSS" role="alert">
                {serverErrors.developmentTechnologist}
                <AiFillExclamationCircle className="alert-sign-CSS" />
              </span>
            )}

            <span
              id="hideOption"
              className="form-CSS"
              style={{display: !check ? "none" : "inline-block"}}
            >
              {check1}
              {errors.course && (
                <span className="span-3-CSS symbol-CSS" role="alert">
                  {errors.course.message}
                  <AiFillExclamationCircle className="alert-sign-CSS" />
                </span>
              )}
              {serverErrors.course && (
                <span className="span-3-CSS symbol-CSS" role="alert">
                  {serverErrors.course}
                  <AiFillExclamationCircle className="alert-sign-CSS" />
                </span>
              )}
              <br />
              {check2}
              {errors.year ? (
                <span className="span-3-CSS symbol-CSS" role="alert">
                  {errors.year.message}
                  <AiFillExclamationCircle className="alert-sign-CSS" />
                </span>
              ) : serverErrors.year && (
                <span className="span-3-CSS symbol-CSS" role="alert">
                  {serverErrors.year}
                  <AiFillExclamationCircle className="alert-sign-CSS" />
                </span>
              )}
            </span>
          </Form.Group>
          <br />
          <br />
          <h3 className="agreement-label-CSS">
            You agree to our{" "}
            <Link
              className="agreement-link-CSS"
              to="/privacy-policy"
              onClick={() => {
                window.scrollTo({top: "0", behavior: "none"});
              }}
            >
              Privacy Policy
            </Link>{" "}
            and our{" "}
            <Link
              className="agreement-link-CSS"
              to="/terms-conditions"
              onClick={() => {
                window.scrollTo({top: "0", behavior: "none"});
              }}
            >
              Terms & Conditions
            </Link>
            . <span className="symbol-CSS">*</span>
          </h3>
          <Form.Check
            className="agreement-terms-CSS"
            name="agreement"
            type="checkbox"
            label="I agree"
            aria-invalid={errors.agreement ? "true" : "false"}
            {...register("agreement", {
              required: {
                value: true,
                message: "*This is a required field.*",
              },
            })}
          />
          {errors.agreement && (
            <span className="span-3-CSS symbol-CSS" role="alert">
              {errors.agreement.message}
              <AiFillExclamationCircle className="alert-sign-CSS" />
            </span>
          )}
          {serverErrors.agreement && (
            <span className="span-3-CSS symbol-CSS" role="alert">
              {serverErrors.agreement}
              <AiFillExclamationCircle className="alert-sign-CSS" />
            </span>
          )}
          <Form.Check
            className="sign-up-notification-CSS"
            name="notification"
            type="checkbox"
            label="Do you wish to get notification on the latest Events & News updates?"
            aria-invalid={errors.notification ? "true" : "false"}
            {...register("notification", {
              required: false,
            })}
          />
          <br />
          <br />
          <Button className="register-button-CSS" type="submit">
            Submit
          </Button>
        </Form>
        <div className="col-md-5 section2-register-CSS">
          <h1 className="register-h1-CSS">Benefits of Joining MERN-Society-CMS</h1>
          <ul className="register-ul-CSS">
            <li className="register-li-CSS">Networking</li>
            <p className="register-p-CSS">
              Membership of The MERN-Society-CMS offers valuable networking
              opportunities with professionals from various industries, allowing you
              to broaden your knowledge and grow your professional network.
            </p>
            <li className="register-li-CSS">Training Courses</li>
            <p className="register-p-CSS">
              Members get first access to accredited training courses.
            </p>
            <li className="register-li-CSS">
              Exclusive invitation to MERN-Society-CMS Events
            </li>
            <p className="register-p-CSS">
              Members will get access to early sign up to MERN-Society-CMS events.
            </p>
            <li className="register-li-CSS">International Links</li>
            <p className="register-p-CSS">
              Connect with professionals from various industries worldwide.
            </p>
            <li className="register-li-CSS">
              Member's Only Section of the Website
            </li>
            <p className="register-p-CSS">
              Additional access to careers information and networking events.
            </p>
            <li className="register-li-CSS">Online Access</li>
            <p className="register-p-CSS">
              As a member of The MERN-Society-CMS, you will have
              access to our knowledge base and recorded events.
            </p>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SignUp;
