import React, {useState, useEffect, useContext, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {Spinner, Form, Table, Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import {AiFillExclamationCircle} from "react-icons/ai";


// CSS
import "./styles/AdminControl.css";


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
  const [selectedOption, setSelectedOption] = useState("");
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverErrors, setServerErrors] = useState({});
  const {isAdmin} = useContext(AuthContext);
  const navigate = useNavigate();
  console.log(errors);


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/admin` : `${ process.env.REACT_APP_BACKEND_DEV }/admin`;

  // Axios Get List of User's Information from the Server
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${ API_URL }/user`);
      return response.data.user;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchUsersAndSetState = async () => {
      const users = await fetchUsers();
      setUser(users);
      setLoading(false);
    };
    fetchUsersAndSetState();
  }, [fetchUsers]);


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
      role: data.role,
    };

    try {
      const updateResponse = await axios.put(`${ API_URL }/user`, payload);
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


  // Admin Control Page redirect to Log In Page if the User is not authorized
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setAuthToken(token);
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      {loading ? (
        <div className="container-fluid text-center container-admin-CSS">
          <h1 className="admin-h1-CSS">MERN-Society-CMS Admin Control Panel</h1>
          <Spinner animation="grow" variant="primary" />
          <h1 className="admin-spinner-CSS">Please wait...</h1>
        </div>
      ) : (
        <>
          {isAdmin() && (
            <div className="container-fluid container-admin-CSS">
              <h1 className="admin-h1-CSS">MERN-Society-CMS Admin Control Panel</h1>
              <Form
                className="col-md-10 admin-control-form-CSS"
                onSubmit={handleSubmit(onUpdate)}
                method="post"
              >
                <Table
                  bordered
                  hover
                  size="sm"
                  variant="primary"
                  responsive="sm"
                >
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user
                      .filter((user) => user.role === "Admin")
                      .map((user) => (
                        <tr key={user._id}>
                          <td>{user.firstName}</td>
                          <td>{user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <Form.Select
                              className="admin-select-CSS"
                              name="role"
                              defaultValue={user.role}
                              options={selectedOption}
                              onChange={(option) => setSelectedOption(option)}
                              aria-invalid={errors.role ? "true" : "false"}
                              {...register(`role[${ user._id }]`, {
                                required: false,
                              })}
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                            </Form.Select>
                          </td>
                        </tr>
                      ))}
                    {user
                      .filter((user) => user.role === "User")
                      .map((user) => (
                        <tr key={user._id}>
                          <td>{user.firstName}</td>
                          <td>{user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <Form.Select
                              className="admin-select-CSS"
                              name="role"
                              defaultValue={user.role}
                              options={selectedOption}
                              onChange={(option) => setSelectedOption(option)}
                              aria-invalid={errors.role ? "true" : "false"}
                              {...register(`role[${ user._id }]`, {
                                required: false,
                              })}
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                            </Form.Select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
                {serverErrors.role && (
                  <span
                    className="span-admin-error-CSS admin-symbol-CSS"
                    role="alert"
                  >
                    {serverErrors.role}
                    <AiFillExclamationCircle className="alert-admin-CSS" />
                  </span>
                )}
                <Button className="admin-control-button-CSS" type="submit">
                  Submit
                </Button>
              </Form>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Account;
