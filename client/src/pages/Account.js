import React, {useState, useEffect, useContext} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Spinner, Form, InputGroup, Button} from "react-bootstrap";
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
import "./styles/Account.css";


// Authentication
import {AuthContext} from "../components/AuthContext";
import setAuthToken from "../components/AuthToken";


const Account = () => {
  const {
    register,
    handleSubmit,
    formState,
    formState: {errors, isSubmitSuccessful},
    reset,
  } = useForm();
  const [showPassword, setShowPassword] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const {isAdmin} = useContext(AuthContext);
  const {userId} = useContext(AuthContext);
  const {adminToken} = useContext(AuthContext);
  const navigate = useNavigate();
  console.log(errors);
  // console.log("Account ID:", userId);


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/account` : `${ process.env.REACT_APP_BACKEND_DEV }/account`;

  // Axios Get User Information from the Server
  useEffect(() => {
    // Set the token as default header for all axios requests
    const fetchUserToken = localStorage.getItem("jwtToken");
    setAuthToken(fetchUserToken);

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${ API_URL }/user/${ userId }`);
        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [API_URL, userId]);


  // Axios Submit Update to Server
  const onUpdate = async (data) => {
    // Set the Authorization header using the setAuthToken function
    const onUpdateToken = localStorage.getItem("jwtToken");
    setAuthToken(onUpdateToken);

    const payload = {
      // Replace with the updated user data
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
    };

    try {
      const updateResponse = await axios.put(
        `${ API_URL }/user/${ data.userId }`,
        payload
      );

      if (!updateResponse.data.success) {
        setServerErrors(updateResponse.data.errors);
      } else {
        // Successful Response
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "success",
          title: "User updated successfully!",
          didClose: () => {
            window.scrollTo({top: 0, behavior: "instant"});
            window.location.reload();
          },
        });
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


  // Account Page redirect to Log In Page if the User is not logged in
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setAuthToken(token);
      navigate("/login");
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
    {value: "Massachusetts", label: "Massachusetts"},
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
      {loading ? (
        <div className="container-fluid text-center container-account-CSS">
          <h1 className="account-form-CSS">MERN-Society-CMS Account Details</h1>
          <Spinner animation="grow" variant="primary" />
          <h1 className="account-spinner-CSS">Please wait...</h1>
        </div>
      ) : (
        <div className="container-fluid row container-account-CSS">
          <h1 className="account-form-CSS">MERN-Society-CMS Account Details</h1>
          <Form
            className="col-md-7 section1-account-CSS"
            onSubmit={handleSubmit(onUpdate)}
            method="post"
          >
            <Form.Group className="user-form-CSS">
              <Form.Label className="account-label-CSS" htmlFor="firstName">
                First Name:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                name="firstName"
                type="text"
                placeholder="First Name"
                defaultValue={user.firstName}
                aria-invalid={errors.firstName ? "true" : "false"}
                {...register("firstName", {
                  required: false,
                  defaultValue: user.firstName,
                })}
              />
              <br />
              <br />
              <br />
              <Form.Label className="account-label-CSS" htmlFor="lastName">
                Last Name:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                name="lastName"
                type="text"
                placeholder="Last Name"
                defaultValue={user.lastName}
                aria-invalid={errors.lastName ? "true" : "false"}
                {...register("lastName", {
                  required: false,
                  defaultValue: user.lastName,
                })}
              />
              <br />
              <br />
              <br />
              <Form.Label className="account-label-CSS" htmlFor="email">
                Email:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                name="email"
                type="text"
                placeholder="Email"
                defaultValue={user.email}
                pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
                aria-invalid={
                  errors.email || serverErrors.email ? "true" : "false"
                }
                {...register("email", {
                  required: false,
                  pattern: {
                    value:
                      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
                    message: "*Please enter a valid email address.*",
                  },
                  defaultValue: user.email,
                })}
              />
              <br />
              {errors.email && (
                <span
                  className="span-1-account-CSS account-symbol-CSS"
                  role="alert"
                >
                  {errors.email.message}
                  <AiFillExclamationCircle className="alert-sign-account-CSS" />
                </span>
              )}
              {serverErrors.email && (
                <span
                  className="span-1-account-CSS account-symbol-CSS"
                  role="alert"
                >
                  {serverErrors.email}
                  <AiFillExclamationCircle className="alert-sign-account-CSS" />
                </span>
              )}
              <br />
              <br />
              <Form.Label className="account-label-CSS" htmlFor="password">
                Password:
              </Form.Label>
              <InputGroup className="account-text-CSS">
                <Form.Control
                  className="account-text-CSS"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\w\d\s]).{10,}$"
                  aria-invalid={errors.password ? "true" : "false"}
                  {...register("password", {
                    required: false,
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
                <Form.Text className="col-md-4 account-require-password-CSS">
                  <li>Uppercase Letters</li>
                  <li>Lowercase Letters</li>
                  <li>Symbols</li>
                  <li>10+ Characters Length</li>
                </Form.Text>
                <div className="col-md-6">
                  {errors.password && (
                    <span
                      className="span-2-account-CSS account-symbol-CSS"
                      role="alert"
                    >
                      {errors.password.message}
                      <AiFillExclamationCircle className="alert-sign-account-CSS" />
                    </span>
                  )}
                  {serverErrors.password && (
                    <span
                      className="span-2-account-CSS account-symbol-CSS"
                      role="alert"
                    >
                      {serverErrors.password}
                      <AiFillExclamationCircle className="alert-sign-account-CSS" />
                    </span>
                  )}
                </div>
              </Form.Group>
              <br />
              <Form.Label className="account-label-CSS" htmlFor="companyName">
                Company Name:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                type="text"
                placeholder="Company Name"
                defaultValue={user.companyName}
                {...register("companyName", {
                  required: false,
                  defaultValue: user.companyName,
                })}
              />
              <br />
              <br />
              <br />
              <Form.Label className="account-label-CSS" htmlFor="jobs">
                Job Role / Position:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                name="jobs"
                type="text"
                placeholder="Job Role / Position"
                defaultValue={user.jobs}
                aria-invalid={errors.jobs ? "true" : "false"}
                {...register("jobs", {
                  required: false,
                  defaultValue: user.jobs,
                })}
              />
              <br />
              <br />
              <br />
              <Form.Label className="account-label-CSS" htmlFor="contactNumber">
                Contact Number:
              </Form.Label>
              <Form.Control
                className="account-text-CSS"
                name="contactNumber"
                type="tel"
                placeholder="Contact Number"
                defaultValue={user.contactNumber}
                pattern="^\+?\d{1,4}?[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$"
                aria-invalid={errors.contactNumber ? "true" : "false"}
                {...register("contactNumber", {
                  required: false,
                  pattern: {
                    value:
                      /^\+?\d{1,4}?[-\s]?\(?\d{1,3}?\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}$/,
                    message:
                      "*+ for international input. - or spaces between the numbers are accepted.*",
                  },
                  defaultValue: user.contactNumber,
                })}
              />
              <br />
              {errors.contactNumber && (
                <span
                  className="span-1-account-CSS account-symbol-CSS"
                  role="alert"
                >
                  {errors.contactNumber.message}
                  <AiFillExclamationCircle className="alert-sign-CSS" />
                </span>
              )}
              {serverErrors.contactNumber && (
                <span
                  className="span-1-account-CSS account-symbol-CSS"
                  role="alert"
                >
                  {serverErrors.contactNumber}
                  <AiFillExclamationCircle className="alert-sign-account-CSS" />
                </span>
              )}
              <br />
              <br />
              <Form.Label className="account-label-CSS">Address:</Form.Label>
              <Form.Control
                className="account-text-CSS"
                type="text"
                placeholder="Address"
                defaultValue={user.address}
                {...register("address", {
                  required: false,
                  defaultValue: user.address,
                })}
              />
              <br />
              <br />
              <br />
              <Form.Label className="account-label-CSS">Town:</Form.Label>
              <Form.Control
                className="account-text-CSS"
                type="text"
                placeholder="Town"
                defaultValue={user.town}
                {...register("town", {
                  required: false,
                  defaultValue: user.town,
                })}
              />
            </Form.Group>
            <br />
            <br />
            <br />
            <Form.Group className="account-form-CSS">
              <Form.Label className="account-label-CSS" htmlFor="country">
                Country:
              </Form.Label>
              {user.country && (
                <Form.Select
                  className="account-select-CSS"
                  name="country"
                  defaultValue={user.country}
                  options={selectedOption}
                  onChange={(option) => setSelectedOption(option)}
                  aria-invalid={errors.country ? "true" : "false"}
                  {...register("country", {
                    required: false,
                    defaultValue: user.country,
                  })}
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
              )}
            </Form.Group>
            <br />
            <br />
            <br />
            <Button className="account-button-CSS" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )}
      {isAdmin() && (
        <div className="container-fluid text-center">
          <Link
            to={`/admin/${ adminToken }`}
            onClick={() => {
              window.scrollTo({top: "0", behavior: "none"});
            }}
          >
            <Button className="admin-control-panel-button-CSS">
              <h1>Admin Control Panel ➤</h1>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Account;
