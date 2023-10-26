import React, {useState, useEffect, useContext, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Form,
  Row,
  Col,
  FloatingLabel,
  Spinner,
  Card,
  Tabs,
  Tab,
  Pagination,
  Button,
  Modal,
} from "react-bootstrap";
import {useForm} from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import {AiFillExclamationCircle} from "react-icons/ai";
import {GoSearch} from "react-icons/go";
import ReactSearchBox from "react-search-box";
import {DateTime} from "luxon";
import {useDropzone} from "react-dropzone";


// CSS
import "./styles/Event.css";


// Default Image
import eventImage from "../images/event.png"


// Authentication
import {AuthContext} from "../components/AuthContext";
import setAuthToken from "../components/AuthToken";


const Event = () => {
  const {
    register: registerOutside,
    formStateOutside,
    handleSubmit: handleSubmitOutside,
    formState: {errors: errorsOutside, isSubmitSuccessfulOutside},
    reset: resetOutside,
  } = useForm();

  const {
    register: registerInside,
    formStateInside,
    handleSubmit: handleSubmitInside,
    formState: {errors: errorsInside, isSubmitSuccessfulInside},
    reset: resetInside,
  } = useForm();

  const {isAdmin} = useContext(AuthContext);
  const [event, setEvent] = useState({});
  const [currentEvent, setCurrentEvent] = useState({});
  const [outsideFiles, setOutsideFiles] = useState([]);
  const [insideFiles, setInsideFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModalUpdateEvent, setShowModalUpdateEvent] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [serverErrorsOutside, setServerErrorsOutside] = useState({});
  const [serverErrorsInside, setServerErrorsInside] = useState({});

  const handleShowModalEvent = (event) => {
    setShowModalUpdateEvent(true);
    setCurrentEvent(event);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleCloseModalEvent = () => {
    setShowModalUpdateEvent(false);
    setServerErrorsInside({});
    setInsideFiles([]);
    resetInside();
  };

  const handleShowModalDelete = (event) => {
    setShowModalDelete(true);
    setCurrentEvent(event);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
    setServerErrorsInside({});
    resetInside();
  };

  console.log(errorsOutside);
  console.log(errorsInside);

  const [activeTab, setActiveTab] = useState("current");
  const [currentPage, setCurrentPage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);
  const itemsPerPage = 9;
  const itemsArchivePerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const startArchiveIndex = (archivePage - 1) * itemsArchivePerPage;

  // Filter Events by Date
  const currentDate = DateTime.now();
  const upcomingEvents = Array.from(event).filter(
    (event) => DateTime.fromISO(event.date) >= currentDate
  );
  const pastEvents = Array.from(event).filter(
    (event) => DateTime.fromISO(event.date) < currentDate
  );

  // Filter Search Events by Title
  const filteredEvents = searchQuery
    ? upcomingEvents.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : upcomingEvents;

  const filteredPastEvents = searchQuery
    ? pastEvents.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : pastEvents;

  // Paginate the Filtered Search Events
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const totalArchivePages = Math.ceil(filteredPastEvents.length / itemsArchivePerPage);

  const eventList = activeTab === "current"
    ? filteredEvents.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const eventArchiveList = activeTab === "archive"
    ? filteredPastEvents.slice(startArchiveIndex, startArchiveIndex + itemsArchivePerPage)
    : [];

  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
    if (eventKey === "current") {
      // Set Current page to 1
      setCurrentPage(1);
    } else {
      // Set Archive page to 1
      setArchivePage(1);
    }
  };

  const handleEventPageChange = (page) => {
    setCurrentPage(page);
  };

  const handleArchivePageChange = (page) => {
    setArchivePage(page);
  };

  const handleSearchQueryChange = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    // Reset Current page when tab changes
    setCurrentPage(1);
    // Reset Archive page when tab changes
    setArchivePage(1);
  }, [activeTab, searchQuery]);

  // Drop Zone Area for Cloudinary
  const {getRootProps: getOutsideRootProps, getInputProps: getOutsideInputProps} = useDropzone({
    accept: {
      "image/*": []
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0])
        });
        setOutsideFiles([file]);
      }
    }
  });

  const {getRootProps: getInsideRootProps, getInputProps: getInsideInputProps} = useDropzone({
    accept: {
      "image/*": []
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0])
        });
        setInsideFiles([file]);
      }
    }
  });

  // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
  useEffect(() => {
    return () => {
      if (outsideFiles[0]) {
        URL.revokeObjectURL(outsideFiles[0].preview);
      }
    };
  }, [outsideFiles]);

  useEffect(() => {
    return () => {
      if (insideFiles[0]) {
        URL.revokeObjectURL(insideFiles[0].preview);
      }
    };
  }, [insideFiles]);

  const displayOutside = outsideFiles[0] && (
    <>
      <img
        className="img-fluid rounded mx-auto d-block display-event-preview-CSS update-event-preview-CSS"
        src={outsideFiles[0].preview}
        // Revoke data uri after image is loaded
        onLoad={() => URL.revokeObjectURL(outsideFiles[0].preview)}
        alt="preview"
      />
    </>
  );

  const displayInside = insideFiles[0] && (
    <>
      <img
        className="img-fluid rounded mx-auto d-block display-event-preview-CSS update-event-preview-CSS"
        src={insideFiles[0].preview}
        // Revoke data uri after image is loaded
        onLoad={() => URL.revokeObjectURL(insideFiles[0].preview)}
        alt="preview"
      />
    </>
  );


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/event` : `${ process.env.REACT_APP_BACKEND_DEV }/event`;

  // Axios Submit Event to Server
  const onSubmit = async (data) => {
    // Build the data object with data from form fields
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("date", data.date);
    formData.append("description", data.description);
    formData.append("link", data.link);
    formData.append("image", outsideFiles[0]);
    setUploading(true);

    try {
      const response = await axios.post(`${ API_URL }/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!response.data.success) {
        setServerErrorsOutside(response.data.errors);
      } else {
        // Successful Response
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "success",
          title: "Great! New Event is added!",
          didClose: () => {
            window.scrollTo({top: 0, behavior: "instant"});
            window.location.reload();
          },
        });
        setServerErrorsOutside({});
        setUploading(false);
        setOutsideFiles([]);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "error",
          title: "Please check your form again!",
          didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
        });
        setServerErrorsOutside(error.response.data.errors);
        setUploading(false);
        setInsideFiles([]);
        console.log(error.response.data.errors);
      } else {
        console.error(error);
      }
    }
  };


  // Axios Fetch Data from Server to Display Informations and Preview Images
  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${ API_URL }/getEvents`);
      const events = response.data.event;

      // Fetch metadata for each event
      const metadataRequests = events.map((event) => {
        return axios.get(`${ API_URL }/preview/${ event._id }`);
      });
      const metadataResponses = await Promise.all(metadataRequests);
      const metadatas = metadataResponses.map((response) => {
        return response.data;
      });

      // Combine events with their metadata
      const eventsWithMetadata = events.map((event, index) => {
        return {
          ...event,
          metadata: metadatas[index],
        };
      });
      return eventsWithMetadata;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchEventsAndSetState = async () => {
      const events = await fetchEvents();
      setEvent(events);
      setLoading(false);
    };
    fetchEventsAndSetState();
  }, [fetchEvents]);


  // Axios Submit Update to Server
  const onUpdate = async (data) => {
    // Set the Authorization header using the setAuthToken function
    const onUpdateToken = localStorage.getItem("jwtToken");
    setAuthToken(onUpdateToken);

    const formData = new FormData();
    // Replace with the updated event data
    formData.append("id", currentEvent._id);
    formData.append("title", data[`title-${ currentEvent._id }`]);
    formData.append("date", data[`date-${ currentEvent._id }`]);
    formData.append("description", data[`description-${ currentEvent._id }`]);
    formData.append("link", data[`link-${ currentEvent._id }`]);
    formData.append("image", insideFiles[0]);
    setUploading(true);

    try {
      const updateResponse = await axios.put(
        `${ API_URL }/update/${ currentEvent._id }`,
        formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!updateResponse.data.success) {
        setServerErrorsInside(updateResponse.data.errors);
        console.log("updateResponse:", updateResponse);
        console.log("updateResponse.data:", updateResponse.data);
      } else {
        // Successful Response
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "success",
          title: "Event updated successfully!",
          didClose: () => {
            window.scrollTo({top: 0, behavior: "instant"});
            window.location.reload();
          },
        });
        setServerErrorsInside({});
        setUploading(false);
        setInsideFiles([]);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        window.scrollTo({top: 0, behavior: "instant"});
        Swal.fire({
          icon: "error",
          title: "Please check your form again!",
          didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
        });
        setServerErrorsInside(error.response.data.errors);
        setUploading(false);
        setInsideFiles([]);
        console.log(error.response.data.errors);
      }
    };
  }


  // Axios Submit Delete to Server
  const onDelete = async (data) => {
    if (currentEvent && currentEvent._id) {
      try {
        // Set the Authorization header using the setAuthToken function
        const onDeleteToken = localStorage.getItem("jwtToken");
        setAuthToken(onDeleteToken);

        const deleteResponse = await axios.delete(
          `${ API_URL }/delete/${ currentEvent._id }`
        );

        if (!deleteResponse.data.success) {
          console.log("deleteResponse:", deleteResponse);
          console.log("deleteResponse.data:", deleteResponse.data);
        } else {
          // Successful Response
          window.scrollTo({top: 0, behavior: "instant"});
          Swal.fire({
            icon: "success",
            title: "Event deleted successfully!",
            didClose: () => {
              window.scrollTo({top: 0, behavior: "instant"});
              window.location.reload();
            },
          });
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          window.scrollTo({top: 0, behavior: "instant"});
          Swal.fire({
            icon: "error",
            title: "An error occurred while deleting the event.",
            didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
          });
          console.log(error.response.data.errors);
        } else {
          console.error(error);
        }
      }
    } else {
      console.error("currentEvent or currentEvent._id is undefined");
    }
  };

  useEffect(() => {
    if (
      isSubmitSuccessfulOutside &&
      !Object.keys(setServerErrorsOutside).length
    ) {
      resetOutside();
    }
  }, [formStateOutside, isSubmitSuccessfulOutside, resetOutside]);

  useEffect(() => {
    if (
      isSubmitSuccessfulInside &&
      !Object.keys(setServerErrorsInside).length
    ) {
      resetInside();
    }
  }, [formStateInside, isSubmitSuccessfulInside, resetInside]);

  return (
    <>
      {!isAdmin() && (
        <>
          <div className="container-fluid row container-event1-CSS">
            <h1 className="h1-event-CSS">MERN-Society-CMS Event</h1>
          </div>
        </>
      )}
      {isAdmin() && (
        <>
          <div className="container-fluid row container-event2-CSS">
            <h1 className="h1-event-CSS">MERN-Society-CMS Event</h1>
            <Form
              className="form-event-CSS"
              onSubmit={handleSubmitOutside(onSubmit)}
              method="post"
              encType="multipart/form-data"
            >
              <Row>
                <Col lg={3}>
                  <FloatingLabel className="event-label-CSS" label="Title">
                    <Form.Control
                      className="event-text-CSS"
                      name="title"
                      type="text"
                      placeholder="Title"
                      aria-invalid={errorsOutside.title ? "true" : "false"}
                      {...registerOutside("title", {
                        required: {
                          value: true,
                          message: "*This is a required field.*",
                        },
                      })}
                    />
                  </FloatingLabel>
                  {errorsOutside.title ? (
                    <span className="event-span-CSS" role="alert">
                      {errorsOutside.title.message}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  ) : serverErrorsOutside.title && (
                    <span className="event-span-CSS" role="alert">
                      {serverErrorsOutside.title}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={3}>
                  <FloatingLabel className="event-label-CSS" label="Date">
                    <Form.Control
                      className="event-text-CSS"
                      name="date"
                      type="text"
                      placeholder="Date"
                      pattern="^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$"
                      aria-invalid={errorsOutside.date ? "true" : "false"}
                      {...registerOutside("date", {
                        required: {
                          value: true,
                          message: "*This is a required field.*",
                        },
                        pattern: {
                          value: /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/,
                          message:
                            "*Please enter the date in the format of (dd/MM/yyyy).*",
                        },
                        validate: (value) => {
                          const inputDate = DateTime.fromFormat(value, "dd/MM/yyyy");
                          if (inputDate.isValid) {
                            if (inputDate > currentDate) {
                              // Date is in the future, validation passes
                              return true;
                            } else {
                              // Date is in the past, validation fails
                              return "*Can't enter past date.*";
                            }
                          } else {
                            // Invalid date format, validation fails
                            return "*Invalid date.*";
                          }
                        },
                      })}
                    />
                  </FloatingLabel>
                  {errorsOutside.date ? (
                    <span className="event-span-CSS" role="alert">
                      {errorsOutside.date.message}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  ) : serverErrorsOutside.date && (
                    <span className="event-span-CSS" role="alert">
                      {serverErrorsOutside.date}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={3}>
                  <FloatingLabel
                    className="event-label-CSS"
                    label="Description"
                  >
                    <Form.Control
                      className="event-text-CSS"
                      name="description"
                      type="text"
                      placeholder="Description"
                      aria-invalid={
                        errorsOutside.description ? "true" : "false"
                      }
                      {...registerOutside("description", {
                        required: {
                          value: true,
                          message: "*This is a required field.*",
                        },
                      })}
                    />
                  </FloatingLabel>
                  {errorsOutside.description ? (
                    <span className="event-span-CSS" role="alert">
                      {errorsOutside.description.message}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  ) : serverErrorsOutside.description && (
                    <span className="event-span-CSS" role="alert">
                      {serverErrorsOutside.description}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={3}>
                  <FloatingLabel className="event-label-CSS" label="Link">
                    <Form.Control
                      className="event-text-CSS"
                      name="link"
                      type="url"
                      placeholder="Link"
                      aria-invalid={errorsOutside.link ? "true" : "false"}
                      {...registerOutside("link", {
                        required: {
                          value: true,
                          message: "*This is a required field.*",
                        },
                        pattern: {
                          value:
                            /^(https?|ftp):\/\/([^\s/?.#-]+-?[^\s/?.#-]*\.?)+(\/[^\s]*)?$/i,
                          message: "*Please enter a valid URL.*",
                        },
                      })}
                    />
                  </FloatingLabel>
                  {errorsOutside.link ? (
                    <span className="event-span-CSS" role="alert">
                      {errorsOutside.link.message}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  ) : serverErrorsOutside.link && (
                    <span className="event-span-CSS" role="alert">
                      {serverErrorsOutside.link}
                      <AiFillExclamationCircle className="alert-event-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
              </Row>
              <Row>
                <Col>
                  {!uploading ? (
                    <>
                      <div {...getOutsideRootProps({className: "event-dropzone-CSS"})}>
                        <Form.Control
                          className="event-text-CSS"
                          name="image"
                          type="file"
                          defaultValue={[]}
                          {...getOutsideInputProps()}
                          {...registerOutside("image")}
                        />
                        <p className="event-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      </div>
                      <br />
                      <aside className="event-area-preview-CSS">
                        {displayOutside}
                      </aside>
                      <br />
                      <br />
                    </>
                  ) : (
                    <>
                      {uploading ? (
                        <div className="container-fluid text-center uploading-event-CSS">
                          <Spinner animation="grow" variant="primary" />
                          <h1 className="uploading-event-spinner-CSS">
                            Uploading...
                          </h1>
                        </div>
                      ) : (
                        <p className="event-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      )}
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button className="submit-event-button-CSS" type="submit">
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="event-line-CSS"></div>
        </>
      )}

      {loading ? (
        <div className="container-fluid text-center loading-event-CSS">
          <Spinner animation="grow" variant="primary" />
          <h1 className="loading-event-spinner-CSS">Please wait...</h1>
        </div>
      ) : (
        <>
          {isAdmin() ? (
            <>
              <br />
              <br />
              <Tabs
                className="tabs-CSS"
                variant="tabs"
                defaultActiveKey="current"
                onSelect={handleTabChange}
              >
                <Tab eventKey="current" title="Current">
                  <div className="container-fluid row text-center event-search-box-CSS">
                    <ReactSearchBox
                      type="search"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      inputFontSize="25px"
                      iconBoxSize="35px"
                      leftIcon={<GoSearch />}
                    />
                    <Button
                      className="event-clear-search-button-CSS"
                      onClick={handleClearSearch}
                    >
                      Clear Search Result
                    </Button>
                    {searchQuery && (
                      <h1 className="search-box-result-CSS">
                        Search Result: {searchQuery}
                      </h1>
                    )}
                  </div>
                  <div className="container-fluid row text-center section1-event-CSS">
                    {eventList.length > 0 ? (
                      eventList.map((event) => (
                        <div className="col-xl-4" key={event._id}>
                          <Card>
                            <Card.Img
                              src={
                                event.image ||
                                event.metadata["image"] ||
                                event.metadata["og:image"] ||
                                eventImage
                              }
                            />
                            <Card.Body>
                              <Card.Title className="event-title-CSS">
                                {event.title}
                              </Card.Title>
                              <Card.Subtitle className="mb-2 text-muted event-date-CSS">
                                {DateTime.fromISO(event.date).toFormat("dd/MM/yyyy")}
                              </Card.Subtitle>
                              <Card.Text className="event-description-CSS">
                                {event.description}
                              </Card.Text>
                              <Row>
                                <Button
                                  className="event-button1-CSS"
                                  onClick={() => handleShowModalEvent(event)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  className="event-button2-CSS"
                                  onClick={() => handleShowModalDelete(event)}
                                >
                                  Delete
                                </Button>
                              </Row>
                              <br />
                              <br />
                              <Button
                                className="event-button1-CSS"
                                href={event.link}
                                target="_blank"
                              >
                                More Information!
                              </Button>
                            </Card.Body>
                          </Card>
                          <br />
                        </div>
                      ))
                    ) : (
                      <>
                        {searchQuery && eventList.length === 0 ? (
                          <h1 className="search-box-result-CSS">
                            No Search Results.
                          </h1>
                        ) : (
                          <>
                            {!searchQuery && eventList.length === 0 && (
                              <h1 className="search-box-result-CSS">
                                No Upcoming Events.
                              </h1>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        {Array.from({length: totalPages}, (e, i) => {
                          const page = i + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => {
                                window.scrollTo({top: "0", behavior: "instant"});
                                handleEventPageChange(page);
                              }}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                      </Pagination>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="archive" title="Archive">
                  <div className="container-fluid row text-center event-search-box-CSS">
                    <ReactSearchBox
                      type="search"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      inputFontSize="25px"
                      iconBoxSize="35px"
                      leftIcon={<GoSearch />}
                    />
                    <Button
                      className="event-clear-search-button-CSS"
                      onClick={handleClearSearch}
                    >
                      Clear Search Result
                    </Button>
                    {searchQuery && (
                      <h1 className="search-box-result-CSS">
                        Search Result: {searchQuery}
                      </h1>
                    )}
                  </div>
                  <div className="container-fluid row text-center section2-event-CSS">
                    {eventArchiveList.length > 0 ? (
                      eventArchiveList.map((event) => (
                        <div className="col-xl-4" key={event._id}>
                          <Card>
                            <Card.Img
                              src={
                                event.image ||
                                event.metadata["image"] ||
                                event.metadata["og:image"] ||
                                eventImage
                              }
                            />
                            <Card.Body>
                              <Card.Title className="event-title-CSS">
                                {event.title}
                              </Card.Title>
                              <Card.Subtitle className="mb-2 text-muted event-date-CSS">
                                {DateTime.fromISO(event.date).toFormat("dd/MM/yyyy")}
                              </Card.Subtitle>
                              <Card.Text className="event-description-CSS">
                                {event.description}
                              </Card.Text>
                              <Row>
                                <Button
                                  className="event-button2-CSS"
                                  onClick={() => handleShowModalDelete(event)}
                                >
                                  Delete
                                </Button>
                              </Row>
                              <br />
                              <br />
                              <Button
                                className="event-button1-CSS"
                                href={event.link}
                                target="_blank"
                              >
                                More Information!
                              </Button>
                            </Card.Body>
                          </Card>
                          <br />
                        </div>
                      ))
                    ) : (
                      <>
                        {searchQuery && eventArchiveList.length === 0 ? (
                          <h1 className="search-box-result-CSS">
                            No Search Results.
                          </h1>
                        ) : (
                          <>
                            {!searchQuery && eventArchiveList.length === 0 && (
                              <h1 className="search-box-result-CSS">
                                No Archive Events.
                              </h1>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        {Array.from({length: totalArchivePages}, (e, i) => {
                          const page = i + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === archivePage}
                              onClick={() => {
                                window.scrollTo({top: "0", behavior: "instant"});
                                handleArchivePageChange(page);
                              }}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                      </Pagination>
                    </div>
                  </div>
                </Tab>
              </Tabs>
              <Modal show={showModalUpdateEvent} onHide={handleCloseModalEvent}>
                <Form
                  className="row form-event-CSS"
                  onSubmit={handleSubmitInside(onUpdate)}
                  method="post"
                  encType="multipart/form-data"
                >
                  <Modal.Title className="title-event-modal-CSS">
                    Update Event Form:
                  </Modal.Title>
                  <Modal.Body>
                    <FloatingLabel className="event-label-CSS" label="Title">
                      <Form.Control
                        className="event-text-CSS"
                        name={`title-${ currentEvent._id }`}
                        type="text"
                        placeholder="Title"
                        defaultValue={currentEvent.title}
                        aria-invalid={errorsInside.title ? "true" : "false"}
                        {...registerInside(`title-${ currentEvent._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.title && (
                      <span className="event-span-CSS" role="alert">
                        {serverErrorsInside.title}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="event-label-CSS" label="Date">
                      <Form.Control
                        className="event-text-CSS"
                        name={`date-${ currentEvent._id }`}
                        type="text"
                        placeholder="Date"
                        defaultValue={DateTime.fromISO(currentEvent.date).toFormat("dd/MM/yyyy")}
                        pattern="^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$"
                        aria-invalid={errorsInside.date ? "true" : "false"}
                        {...registerInside(`date-${ currentEvent._id }`, {
                          pattern: {
                            value: /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/,
                            message:
                              "*Please enter the date in the format of (dd/MM/yyyy).*",
                          },
                          validate: (value) => {
                            if (!value) {
                              return true;
                            }
                            const inputDate = DateTime.fromFormat(value, "dd/MM/yyyy");
                            const currentDate = DateTime.now();
                            if (inputDate.isValid) {
                              if (inputDate > currentDate) {
                                // Date is in the future, validation passes
                                return true;
                              } else {
                                // Date is in the past, validation fails
                                return "*Can't enter past date.*";
                              }
                            } else {
                              // Invalid date format, validation fails
                              return "*Invalid date.*";
                            }
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`date-${ currentEvent._id }`] ? (
                      <span className="event-span-CSS" role="alert">
                        {errorsInside[`date-${ currentEvent._id }`].message}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    ) : serverErrorsInside.date && (
                      <span className="event-span-CSS" role="alert">
                        {serverErrorsInside.date}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel
                      className="event-label-CSS"
                      label="Description"
                    >
                      <Form.Control
                        className="event-text-CSS"
                        style={{height: "350px"}}
                        name={`description-${ currentEvent._id }`}
                        as="textarea"
                        placeholder="Description"
                        defaultValue={currentEvent.description}
                        aria-invalid={
                          errorsInside.description ? "true" : "false"
                        }
                        {...registerInside(`description-${ currentEvent._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.description && (
                      <span className="event-span-CSS" role="alert">
                        {serverErrorsInside.description}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="event-label-CSS" label="Link">
                      <Form.Control
                        className="event-text-CSS"
                        name={`link-${ currentEvent._id }`}
                        type="url"
                        placeholder="Link"
                        defaultValue={currentEvent.link}
                        aria-invalid={errorsInside.link ? "true" : "false"}
                        {...registerInside(`link-${ currentEvent._id }`, {
                          required: false,
                          pattern: {
                            value:
                              /^(https?|ftp):\/\/([^\s/?.#-]+-?[^\s/?.#-]*\.?)+(\/[^\s]*)?$/i,
                            message: "*Please enter a valid URL.*",
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`link-${ currentEvent._id }`] ? (
                      <span className="event-span-CSS" role="alert">
                        {errorsInside[`link-${ currentEvent._id }`].message}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    ) : serverErrorsInside.link && (
                      <span className="event-span-CSS" role="alert">
                        {serverErrorsInside.link}
                        <AiFillExclamationCircle className="alert-event-CSS" />
                      </span>
                    )}
                    <br />
                    {!uploading ? (
                      <>
                        <div {...getInsideRootProps({className: "event-dropzone-CSS"})}>
                          <Form.Control
                            className="event-text-CSS"
                            name="image"
                            type="file"
                            defaultValue={[]}
                            {...getInsideInputProps()}
                            {...registerOutside("image")}
                          />
                          <p className="event-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        </div>
                        <br />
                        <aside className="event-area-preview-CSS">
                          {displayInside}
                        </aside>
                        <br />
                        <br />
                      </>
                    ) : (
                      <>
                        {uploading ? (
                          <div className="container-fluid text-center uploading-event-CSS">
                            <Spinner animation="grow" variant="primary" />
                            <h1 className="uploading-event-spinner-CSS">
                              Uploading...
                            </h1>
                          </div>
                        ) : (
                          <p className="event-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        )}
                      </>
                    )}
                    <br />
                  </Modal.Body>
                  <div>
                    <Button
                      className="event-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalEvent}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="event-save-button-CSS"
                      variant="primary"
                      type="submit"
                    >
                      Save
                    </Button>
                  </div>
                </Form>
              </Modal>

              <Modal show={showModalDelete} onHide={handleCloseModalDelete}>
                <Form
                  className="row form-event-CSS"
                  onSubmit={handleSubmitInside(onDelete)}
                  method="post"
                >
                  <Modal.Title className="title-event-modal-CSS">
                    Delete Event:
                  </Modal.Title>
                  <br />
                  <br />
                  <Modal.Body>
                    <h3>Permanently delete {currentEvent.title} are you sure?</h3>
                  </Modal.Body>
                  <div>
                    <Button
                      className="event-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalDelete}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="event-delete-button-CSS"
                      variant="danger"
                      type="submit"
                    >
                      Delete
                    </Button>
                  </div>
                </Form>
              </Modal>
            </>
          ) : (
            <>
              <Tabs
                className="tabs-CSS"
                variant="tabs"
                defaultActiveKey="current"
                onSelect={handleTabChange}
              >
                <Tab eventKey="current" title="Current">
                  <div className="container-fluid row text-center event-search-box-CSS">
                    <ReactSearchBox
                      type="search"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      inputFontSize="25px"
                      iconBoxSize="35px"
                      leftIcon={<GoSearch />}
                    />
                    <Button
                      className="event-clear-search-button-CSS"
                      onClick={handleClearSearch}
                    >
                      Clear Search Result
                    </Button>
                    {searchQuery && (
                      <h1 className="search-box-result-CSS">
                        Search Result: {searchQuery}
                      </h1>
                    )}
                  </div>
                  <div className="container-fluid row text-center section1-event-CSS">
                    {eventList.length > 0 ? (
                      eventList.map((event) => (
                        <div className="col-xl-4" key={event._id}>
                          <Card>
                            <Card.Img
                              src={
                                event.image ||
                                event.metadata["image"] ||
                                event.metadata["og:image"] ||
                                eventImage
                              }
                            />
                            <Card.Body>
                              <Card.Title className="event-title-CSS">
                                {event.title}
                              </Card.Title>
                              <Card.Subtitle className="mb-2 text-muted event-date-CSS">
                                {DateTime.fromISO(event.date).toFormat("dd/MM/yyyy")}
                              </Card.Subtitle>
                              <Card.Text className="event-description-CSS">
                                {event.description}
                              </Card.Text>
                              <Button
                                className="event-button1-CSS"
                                href={event.link}
                                target="_blank"
                              >
                                More Information!
                              </Button>
                            </Card.Body>
                          </Card>
                          <br />
                        </div>
                      ))
                    ) : (
                      <>
                        {searchQuery && eventList.length === 0 ? (
                          <h1 className="search-box-result-CSS">
                            No Search Results.
                          </h1>
                        ) : (
                          <>
                            {!searchQuery && eventList.length === 0 && (
                              <h1 className="search-box-result-CSS">
                                No Upcoming Events.
                              </h1>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        {Array.from({length: totalPages}, (e, i) => {
                          const page = i + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => {
                                window.scrollTo({top: "0", behavior: "instant"});
                                handleEventPageChange(page);
                              }}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                      </Pagination>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="archive" title="Archive">
                  <div className="container-fluid row text-center event-search-box-CSS">
                    <ReactSearchBox
                      type="search"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchQueryChange}
                      inputFontSize="25px"
                      iconBoxSize="35px"
                      leftIcon={<GoSearch />}
                    />
                    <Button
                      className="event-clear-search-button-CSS"
                      onClick={handleClearSearch}
                    >
                      Clear Search Result
                    </Button>
                    {searchQuery && (
                      <h1 className="search-box-result-CSS">
                        Search Result: {searchQuery}
                      </h1>
                    )}
                  </div>
                  <div className="container-fluid row text-center section2-event-CSS">
                    {eventArchiveList.length > 0 ? (
                      eventArchiveList.map((event) => (
                        <div className="col-xl-4" key={event._id}>
                          <Card>
                            <Card.Img
                              src={
                                event.image ||
                                event.metadata["image"] ||
                                event.metadata["og:image"] ||
                                eventImage
                              }
                            />
                            <Card.Body>
                              <Card.Title className="event-title-CSS">
                                {event.title}
                              </Card.Title>
                              <Card.Subtitle className="mb-2 text-muted event-date-CSS">
                                {DateTime.fromISO(event.date).toFormat("dd/MM/yyyy")}
                              </Card.Subtitle>
                              <Card.Text className="event-description-CSS">
                                {event.description}
                              </Card.Text>
                              <Button
                                className="event-button1-CSS"
                                href={event.link}
                                target="_blank"
                              >
                                More Information!
                              </Button>
                            </Card.Body>
                          </Card>
                          <br />
                        </div>
                      ))
                    ) : (
                      <>
                        {searchQuery && eventArchiveList.length === 0 ? (
                          <h1 className="search-box-result-CSS">
                            No Search Results.
                          </h1>
                        ) : (
                          <>
                            {!searchQuery && eventArchiveList.length === 0 && (
                              <h1 className="search-box-result-CSS">
                                No Archive Events.
                              </h1>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        {Array.from({length: totalArchivePages}, (e, i) => {
                          const page = i + 1;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === archivePage}
                              onClick={() => {
                                window.scrollTo({top: "0", behavior: "instant"});
                                handleArchivePageChange(page);
                              }}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                      </Pagination>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Event;
