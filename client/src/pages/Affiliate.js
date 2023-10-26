import React, {useState, useEffect, useContext, useCallback} from "react";
import "bootstrap/dist/css/bootstrap.css";
import {
  Form,
  Row,
  Col,
  FloatingLabel,
  Spinner,
  Card,
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
import "./styles/Affiliate.css";


// Default Image
import affiliateImage from "../images/affiliate.png"


// Authentication
import {AuthContext} from "../components/AuthContext";
import setAuthToken from "../components/AuthToken";


const Affiliate = () => {
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
  const [affiliate, setAffiliate] = useState({});
  const [currentAffiliate, setCurrentAffiliate] = useState({});
  const [outsideFiles, setOutsideFiles] = useState([]);
  const [insideFiles, setInsideFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModalUpdateAffiliate, setShowModalUpdateAffiliate] = useState(false);
  const [showModalReadAffiliate, setShowModalReadAffiliate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [serverErrorsOutside, setServerErrorsOutside] = useState({});
  const [serverErrorsInside, setServerErrorsInside] = useState({});

  const handleShowModalUpdateAffiliate = (affiliate) => {
    setShowModalUpdateAffiliate(true);
    setCurrentAffiliate(affiliate);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleShowModalReadAffiliate = (affiliate) => {
    setShowModalReadAffiliate(true);
    setCurrentAffiliate(affiliate);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleShowModalGuestReadAffiliate = (affiliate) => {
    setShowModalReadAffiliate(true);
    setCurrentAffiliate(affiliate);
  };

  const handleCloseModalAffiliate = () => {
    setShowModalUpdateAffiliate(false);
    setShowModalReadAffiliate(false);
    setServerErrorsInside({});
    setInsideFiles([]);
    resetInside();
  };

  const handleShowModalDelete = (affiliate) => {
    setShowModalDelete(true);
    setCurrentAffiliate(affiliate);
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Filter Search Affiliate by Title
  const filteredAffiliate = Array.from(affiliate).filter((affiliate) =>
    affiliate.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the Filtered Search Affiliate
  const totalPages = Math.ceil(filteredAffiliate.length / itemsPerPage);

  const affiliateList = filteredAffiliate.slice(startIndex, startIndex + itemsPerPage);

  const handleAffiliatePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchQueryChange = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

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
        className="img-fluid rounded mx-auto d-block display-affiliate-preview-CSS update-affiliate-preview-CSS"
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
        className="img-fluid rounded mx-auto d-block display-affiliate-preview-CSS update-affiliate-preview-CSS"
        src={insideFiles[0].preview}
        // Revoke data uri after image is loaded
        onLoad={() => URL.revokeObjectURL(insideFiles[0].preview)}
        alt="preview"
      />
    </>
  );


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/affiliate` : `${ process.env.REACT_APP_BACKEND_DEV }/affiliate`;

  // Axios Submit Affiliate to Server
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
          title: "Affiliate created successfully!",
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
  const fetchAffiliate = useCallback(async () => {
    try {
      const response = await axios.get(`${ API_URL }/getAffiliate`);
      const affiliates = response.data.affiliate;

      // Fetch metadata for each affiliate
      const metadataRequests = affiliates.map((affiliate) => {
        return axios.get(`${ API_URL }/preview/${ affiliate._id }`);
      });
      const metadataResponses = await Promise.all(metadataRequests);
      const metadatas = metadataResponses.map((response) => {
        return response.data;
      });

      // Combine affiliate with their metadata
      const affiliateWithMetadata = affiliates.map((affiliate, index) => {
        return {
          ...affiliate,
          metadata: metadatas[index],
        };
      });
      return affiliateWithMetadata;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchAffiliateAndSetState = async () => {
      const affiliate = await fetchAffiliate();
      setAffiliate(affiliate);
      setLoading(false);
    };
    fetchAffiliateAndSetState();
  }, [fetchAffiliate]);


  // Axios Submit Update to Server
  const onUpdate = async (data) => {
    // Set the Authorization header using the setAuthToken function
    const onUpdateToken = localStorage.getItem("jwtToken");
    setAuthToken(onUpdateToken);

    const formData = new FormData();
    // Replace with the updated affiliate data
    formData.append("id", currentAffiliate._id);
    formData.append("title", data[`title-${ currentAffiliate._id }`]);
    formData.append("date", data[`date-${ currentAffiliate._id }`]);
    formData.append("description", data[`description-${ currentAffiliate._id }`]);
    formData.append("link", data[`link-${ currentAffiliate._id }`]);
    formData.append("image", insideFiles[0]);
    setUploading(true);

    try {
      const updateResponse = await axios.put(
        `${ API_URL }/update/${ currentAffiliate._id }`,
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
          title: "Affiliate updated successfully!",
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
    if (currentAffiliate && currentAffiliate._id) {
      try {
        // Set the Authorization header using the setAuthToken function
        const onDeleteToken = localStorage.getItem("jwtToken");
        setAuthToken(onDeleteToken);

        const deleteResponse = await axios.delete(
          `${ API_URL }/delete/${ currentAffiliate._id }`
        );

        if (!deleteResponse.data.success) {
          console.log("deleteResponse:", deleteResponse);
          console.log("deleteResponse.data:", deleteResponse.data);
        } else {
          // Successful Response
          window.scrollTo({top: 0, behavior: "instant"});
          Swal.fire({
            icon: "success",
            title: "Affiliate deleted successfully!",
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
            title: "An error occurred while deleting the Affiliate.",
            didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
          });
          console.log(error.response.data.errors);
        } else {
          console.error(error);
        }
      }
    } else {
      console.error("currentAffiliate or currentAffiliate._id is undefined");
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
          <div className="container-fluid row container-affiliate1-CSS">
            <h1 className="h1-affiliate-CSS">MERN-Society-CMS Affiliate</h1>
            <p className="p-affiliate-CSS">
              Be an affiliate with us. Being on our membership panel allows free
              membership registration for your company for up to 5 personnel and
              registered members enjoy discounted live events and technical webinars.
              They can access posted recordings after the event.
            </p>
          </div>
        </>
      )}
      {isAdmin() && (
        <>
          <div className="container-fluid row container-affiliate2-CSS">
            <h1 className="h1-affiliate-CSS">MERN-Society-CMS Affiliate</h1>
            <p className="p-affiliate-CSS">
              Be an affiliate with us. Being our membership panel allows free
              membership registration for your company for up to 5 personnel and
              register members enjoys discounted live events and technical webinars.
              They can also access posted recording after the event.
            </p>
            <Form
              className="form-affiliate-CSS"
              onSubmit={handleSubmitOutside(onSubmit)}
              method="post"
              encType="multipart/form-data"
            >
              <Row>
                <Col lg={6}>
                  <FloatingLabel className="affiliate-label-CSS" label="Title">
                    <Form.Control
                      className="affiliate-text-CSS"
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
                    <span className="affiliate-span-CSS" role="alert">
                      {errorsOutside.title.message}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  ) : serverErrorsOutside.title && (
                    <span className="affiliate-span-CSS" role="alert">
                      {serverErrorsOutside.title}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={6}>
                  <FloatingLabel className="affiliate-label-CSS" label="Date">
                    <Form.Control
                      className="affiliate-text-CSS"
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
                      })}
                    />
                  </FloatingLabel>
                  {errorsOutside.date ? (
                    <span className="affiliate-span-CSS" role="alert">
                      {errorsOutside.date.message}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  ) : serverErrorsOutside.date && (
                    <span className="affiliate-span-CSS" role="alert">
                      {serverErrorsOutside.date}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={12}>
                  <FloatingLabel
                    className="affiliate-label-CSS"
                    label="Description"
                  >
                    <Form.Control
                      className="affiliate-text-CSS"
                      style={{height: "250px"}}
                      name="description"
                      as="textarea"
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
                    <span className="affiliate-span-CSS" role="alert">
                      {errorsOutside.description.message}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  ) : serverErrorsOutside.description && (
                    <span className="affiliate-span-CSS" role="alert">
                      {serverErrorsOutside.description}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={12}>
                  <FloatingLabel className="affiliate-label-CSS" label="Link (Optional)">
                    <Form.Control
                      className="affiliate-text-CSS"
                      name="link"
                      type="url"
                      placeholder="Link"
                      aria-invalid={errorsOutside.link ? "true" : "false"}
                      {...registerOutside("link", {
                        required: {
                          value: false,
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
                    <span className="affiliate-span-CSS" role="alert">
                      {errorsOutside.link.message}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
                    </span>
                  ) : serverErrorsOutside.link && (
                    <span className="affiliate-span-CSS" role="alert">
                      {serverErrorsOutside.link}
                      <AiFillExclamationCircle className="alert-affiliate-CSS" />
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
                      <div {...getOutsideRootProps({className: "affiliate-dropzone-CSS"})}>
                        <Form.Control
                          className="affiliate-text-CSS"
                          name="image"
                          type="file"
                          defaultValue={[]}
                          {...getOutsideInputProps()}
                          {...registerOutside("image")}
                        />
                        <p className="affiliate-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      </div>
                      <br />
                      <aside className="affiliate-area-preview-CSS">
                        {displayOutside}
                      </aside>
                      <br />
                      <br />
                    </>
                  ) : (
                    <>
                      {uploading ? (
                        <div className="container-fluid text-center uploading-affiliate-CSS">
                          <Spinner animation="grow" variant="primary" />
                          <h1 className="uploading-affiliate-spinner-CSS">Uploading...</h1>
                        </div>
                      ) : (
                        <p className="affiliate-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      )}
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button className="submit-affiliate-button-CSS" type="submit">
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="affiliate-line-CSS"></div>
        </>
      )}

      {loading ? (
        <div className="container-fluid text-center loading-affiliate-CSS">
          <Spinner animation="grow" variant="primary" />
          <h1 className="loading-affiliate-spinner-CSS">Please wait...</h1>
        </div>
      ) : (
        <>
          {isAdmin() ? (
            <>
              <br />
              <br />
              <div className="container-fluid row text-center affiliate-search-box-CSS">
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
                  className="affiliate-clear-search-button-CSS"
                  onClick={handleClearSearch}
                >
                  Clear Search Result
                </Button>
                {searchQuery && (
                  <h1 className="affiliate-search-box-result-CSS">
                    Search Result: {searchQuery}
                  </h1>
                )}
              </div>
              <div className="container-fluid row text-center section1-affiliate-CSS">
                {affiliateList.length > 0 ? (
                  affiliateList.map((affiliate) => (
                    <div className="col-xl-4" key={affiliate._id}>
                      <Card>
                        <Card.Img
                          src={
                            affiliate.image ||
                            affiliate.metadata["image"] ||
                            affiliate.metadata["og:image"] ||
                            affiliateImage
                          }
                        />
                        <Card.Body>
                          <Card.Title className="affiliate-title-CSS">
                            {affiliate.title}
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted affiliate-date-CSS">
                            {DateTime.fromISO(affiliate.date).toFormat("dd/MM/yyyy")}
                          </Card.Subtitle>
                          <Row>
                            <Button
                              className="affiliate-button1-CSS"
                              onClick={() => handleShowModalUpdateAffiliate(affiliate)}
                            >
                              Edit
                            </Button>
                            <Button
                              className="affiliate-button2-CSS"
                              onClick={() => handleShowModalDelete(affiliate)}
                            >
                              Delete
                            </Button>
                          </Row>
                          <br />
                          <br />
                          <Button
                            className="affiliate-button1-CSS"
                            onClick={() => handleShowModalReadAffiliate(affiliate)}
                          >
                            Read More!
                          </Button>
                        </Card.Body>
                      </Card>
                      <br />
                    </div>
                  ))
                ) : (
                  <>
                    {searchQuery && affiliateList.length === 0 ? (
                      <h1 className="affiliate-search-box-result-CSS">
                        No Search Results.
                      </h1>
                    ) : (
                      <>
                        {!searchQuery && affiliateList.length === 0 && (
                          <h1 className="affiliate-search-box-result-CSS">
                            No Affiliate.
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
                            handleAffiliatePageChange(page);
                          }}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                  </Pagination>
                </div>
              </div>
              <Modal show={showModalUpdateAffiliate} onHide={handleCloseModalAffiliate}>
                <Form
                  className="row form-affiliate-CSS"
                  onSubmit={handleSubmitInside(onUpdate)}
                  method="post"
                >
                  <Modal.Title className="title-affiliate-modal-CSS">
                    Update Affiliate Form:
                  </Modal.Title>
                  <Modal.Body>
                    <FloatingLabel className="affiliate-label-CSS" label="Title">
                      <Form.Control
                        className="affiliate-text-CSS"
                        name={`title-${ currentAffiliate._id }`}
                        type="text"
                        placeholder="Title"
                        defaultValue={currentAffiliate.title}
                        aria-invalid={errorsInside.title ? "true" : "false"}
                        {...registerInside(`title-${ currentAffiliate._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.title && (
                      <span className="affiliate-span-CSS" role="alert">
                        {serverErrorsInside.title}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="affiliate-label-CSS" label="Date">
                      <Form.Control
                        className="affiliate-text-CSS"
                        name={`date-${ currentAffiliate._id }`}
                        type="text"
                        placeholder="Date"
                        defaultValue={DateTime.fromISO(currentAffiliate.date).toFormat("dd/MM/yyyy")}
                        pattern="^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$"
                        aria-invalid={errorsInside.date ? "true" : "false"}
                        {...registerInside(`date-${ currentAffiliate._id }`, {
                          pattern: {
                            value: /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/,
                            message:
                              "*Please enter the date in the format of (dd/MM/yyyy).*",
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`date-${ currentAffiliate._id }`] ? (
                      <span className="affiliate-span-CSS" role="alert">
                        {errorsInside[`date-${ currentAffiliate._id }`].message}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    ) : serverErrorsInside.date && (
                      <span className="affiliate-span-CSS" role="alert">
                        {serverErrorsInside.date}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel
                      className="affiliate-label-CSS"
                      label="Description"
                    >
                      <Form.Control
                        className="affiliate-text-CSS"
                        style={{height: "350px"}}
                        name={`description-${ currentAffiliate._id }`}
                        as="textarea"
                        placeholder="Description"
                        defaultValue={currentAffiliate.description}
                        aria-invalid={
                          errorsInside.description ? "true" : "false"
                        }
                        {...registerInside(`description-${ currentAffiliate._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.description && (
                      <span className="affiliate-span-CSS" role="alert">
                        {serverErrorsInside.description}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="affiliate-label-CSS" label="Link">
                      <Form.Control
                        className="affiliate-text-CSS"
                        name={`link-${ currentAffiliate._id }`}
                        type="url"
                        placeholder="Link"
                        defaultValue={currentAffiliate.link}
                        aria-invalid={errorsInside.link ? "true" : "false"}
                        {...registerInside(`link-${ currentAffiliate._id }`, {
                          required: false,
                          pattern: {
                            value:
                              /^(https?|ftp):\/\/([^\s/?.#-]+-?[^\s/?.#-]*\.?)+(\/[^\s]*)?$/i,
                            message: "*Please enter a valid URL.*",
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`link-${ currentAffiliate._id }`] ? (
                      <span className="affiliate-span-CSS" role="alert">
                        {errorsInside[`link-${ currentAffiliate._id }`].message}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    ) : serverErrorsInside.link && (
                      <span className="affiliate-span-CSS" role="alert">
                        {serverErrorsInside.link}
                        <AiFillExclamationCircle className="alert-affiliate-CSS" />
                      </span>
                    )}
                    <br />
                    {!uploading ? (
                      <>
                        <div {...getInsideRootProps({className: "affiliate-dropzone-CSS"})}>
                          <Form.Control
                            className="affiliate-text-CSS"
                            name="image"
                            type="file"
                            defaultValue={[]}
                            {...getInsideInputProps()}
                            {...registerOutside("image")}
                          />
                          <p className="affiliate-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        </div>
                        <br />
                        <aside className="affiliate-area-preview-CSS">
                          {displayInside}
                        </aside>
                        <br />
                        <br />
                      </>
                    ) : (
                      <>
                        {uploading ? (
                          <div className="container-fluid text-center uploading-affiliate-CSS">
                            <Spinner animation="grow" variant="primary" />
                            <h1 className="uploading-affiliate-spinner-CSS">Uploading...</h1>
                          </div>
                        ) : (
                          <p className="affiliate-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        )}
                      </>
                    )}
                    <br />
                  </Modal.Body>
                  <div>
                    <Button
                      className="affiliate-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalAffiliate}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="affiliate-save-button-CSS"
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
                  className="row form-affiliate-CSS"
                  onSubmit={handleSubmitInside(onDelete)}
                  method="post"
                >
                  <Modal.Title className="title-affiliate-modal-CSS">
                    Delete Affiliate:
                  </Modal.Title>
                  <br />
                  <br />
                  <Modal.Body>
                    <h3>Permanently delete {currentAffiliate.title} are you sure?</h3>
                  </Modal.Body>
                  <div>
                    <Button
                      className="affiliate-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalDelete}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="affiliate-delete-button-CSS"
                      variant="danger"
                      type="submit"
                    >
                      Delete
                    </Button>
                  </div>
                </Form>
              </Modal>

              <Modal show={showModalReadAffiliate} onHide={handleCloseModalAffiliate}>
                <div className="read-affiliate-CSS">
                  <Card>
                    <Card.Img
                      src={
                        currentAffiliate.image ||
                        (currentAffiliate.metadata && currentAffiliate.metadata["image"]) ||
                        (currentAffiliate.metadata && currentAffiliate.metadata["og:image"]) ||
                        affiliateImage
                      }
                    />
                    <Card.Body>
                      <Card.Title className="affiliate-title-CSS">
                        {currentAffiliate.title}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted affiliate-date-CSS">
                        {DateTime.fromISO(currentAffiliate.date).toFormat("dd/MM/yyyy")}
                      </Card.Subtitle>
                      <Card.Text className="affiliate-description-CSS">
                        {currentAffiliate.description}
                      </Card.Text>
                      {currentAffiliate.link && (
                        <Button
                          className="affiliate-link-button-CSS"
                          href={currentAffiliate.link}
                          target="_blank"
                        >
                          More Information!
                        </Button>
                      )}
                      <div>
                        <Button
                          className="affiliate-cancel-button-CSS"
                          variant="secondary"
                          onClick={handleCloseModalAffiliate}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Modal>
            </>
          ) : (
            <>
              <div className="container-fluid row text-center affiliate-search-box-CSS">
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
                  className="affiliate-clear-search-button-CSS"
                  onClick={handleClearSearch}
                >
                  Clear Search Result
                </Button>
                {searchQuery && (
                  <h1 className="affiliate-search-box-result-CSS">
                    Search Result: {searchQuery}
                  </h1>
                )}
              </div>
              <div className="container-fluid row text-center section1-affiliate-CSS">
                {affiliateList.length > 0 ? (
                  affiliateList.map((affiliate) => (
                    <div className="col-xl-4" key={affiliate._id}>
                      <Card>
                        <Card.Img
                          src={
                            affiliate.image ||
                            affiliate.metadata["image"] ||
                            affiliate.metadata["og:image"] ||
                            affiliateImage
                          }
                        />
                        <Card.Body>
                          <Card.Title className="affiliate-title-CSS">
                            {affiliate.title}
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted affiliate-date-CSS">
                            {DateTime.fromISO(affiliate.date).toFormat("dd/MM/yyyy")}
                          </Card.Subtitle>
                          <br />
                          <br />
                          <Button
                            className="affiliate-button1-CSS"
                            onClick={() => handleShowModalGuestReadAffiliate(affiliate)}
                          >
                            Read More!
                          </Button>
                        </Card.Body>
                      </Card>
                      <br />
                    </div>
                  ))
                ) : (
                  <>
                    {searchQuery && affiliateList.length === 0 ? (
                      <h1 className="affiliate-search-box-result-CSS">
                        No Search Results.
                      </h1>
                    ) : (
                      <>
                        {!searchQuery && affiliateList.length === 0 && (
                          <h1 className="affiliate-search-box-result-CSS">
                            No Affiliate.
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
                            handleAffiliatePageChange(page);
                          }}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                  </Pagination>
                </div>
              </div>

              <Modal show={showModalReadAffiliate} onHide={handleCloseModalAffiliate}>
                <div className="read-affiliate-CSS">
                  <Card>
                    <Card.Img
                      src={
                        currentAffiliate.image ||
                        (currentAffiliate.metadata && currentAffiliate.metadata["image"]) ||
                        (currentAffiliate.metadata && currentAffiliate.metadata["og:image"]) ||
                        affiliateImage
                      }
                    />
                    <Card.Body>
                      <Card.Title className="affiliate-title-CSS">
                        {currentAffiliate.title}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted affiliate-date-CSS">
                        {DateTime.fromISO(currentAffiliate.date).toFormat("dd/MM/yyyy")}
                      </Card.Subtitle>
                      <Card.Text className="affiliate-description-CSS">
                        {currentAffiliate.description}
                      </Card.Text>
                      {currentAffiliate.link && (
                        <Button
                          className="affiliate-link-button-CSS"
                          href={currentAffiliate.link}
                          target="_blank"
                        >
                          More Information!
                        </Button>
                      )}
                      <div>
                        <Button
                          className="affiliate-cancel-button-CSS"
                          variant="secondary"
                          onClick={handleCloseModalAffiliate}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Modal>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Affiliate;
