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
import "./styles/News.css";


// Default Image
import newsImage from "../images/news.png"


// Authentication
import {AuthContext} from "../components/AuthContext";
import setAuthToken from "../components/AuthToken";


const News = () => {
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
  const [news, setNews] = useState({});
  const [currentNews, setCurrentNews] = useState({});
  const [outsideFiles, setOutsideFiles] = useState([]);
  const [insideFiles, setInsideFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModalUpdateNews, setShowModalUpdateNews] = useState(false);
  const [showModalReadNews, setShowModalReadNews] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [serverErrorsOutside, setServerErrorsOutside] = useState({});
  const [serverErrorsInside, setServerErrorsInside] = useState({});

  const handleShowModalUpdateNews = (news) => {
    setShowModalUpdateNews(true);
    setCurrentNews(news);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleShowModalReadNews = (news) => {
    setShowModalReadNews(true);
    setCurrentNews(news);
    setServerErrorsOutside({});
    setOutsideFiles([]);
    resetOutside();
  };

  const handleShowModalGuestReadNews = (news) => {
    setShowModalReadNews(true);
    setCurrentNews(news);
  };

  const handleCloseModalNews = () => {
    setShowModalUpdateNews(false);
    setShowModalReadNews(false);
    setServerErrorsInside({});
    setInsideFiles([]);
    resetInside();
  };

  const handleShowModalDelete = (news) => {
    setShowModalDelete(true);
    setCurrentNews(news);
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

  // Filter Search News by Title
  const filteredNews = Array.from(news).filter((news) =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the Filtered Search News
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const newsList = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const handleNewsPageChange = (page) => {
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
        className="img-fluid rounded mx-auto d-block display-news-preview-CSS update-news-preview-CSS"
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
        className="img-fluid rounded mx-auto d-block display-news-preview-CSS update-news-preview-CSS"
        src={insideFiles[0].preview}
        // Revoke data uri after image is loaded
        onLoad={() => URL.revokeObjectURL(insideFiles[0].preview)}
        alt="preview"
      />
    </>
  );


  const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/news` : `${ process.env.REACT_APP_BACKEND_DEV }/news`;

  // Axios Submit News to Server
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
          title: "News created successfully!",
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
  const fetchNews = useCallback(async () => {
    try {
      const response = await axios.get(`${ API_URL }/getNews`);
      const news = response.data.news;

      // Fetch metadata for each news
      const metadataRequests = news.map((news) => {
        return axios.get(`${ API_URL }/preview/${ news._id }`);
      });
      const metadataResponses = await Promise.all(metadataRequests);
      const metadatas = metadataResponses.map((response) => {
        return response.data;
      });

      // Combine news with their metadata
      const newsWithMetadata = news.map((news, index) => {
        return {
          ...news,
          metadata: metadatas[index],
        };
      });

      return newsWithMetadata;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchNewsAndSetState = async () => {
      const news = await fetchNews();
      setNews(news);
      setLoading(false);
    };
    fetchNewsAndSetState();
  }, [fetchNews]);


  // Axios Submit Update to Server
  const onUpdate = async (data) => {
    // Set the Authorization header using the setAuthToken function
    const onUpdateToken = localStorage.getItem("jwtToken");
    setAuthToken(onUpdateToken);

    const formData = new FormData();
    // Replace with the updated news data
    formData.append("id", currentNews._id);
    formData.append("title", data[`title-${ currentNews._id }`]);
    formData.append("date", data[`date-${ currentNews._id }`]);
    formData.append("description", data[`description-${ currentNews._id }`]);
    formData.append("link", data[`link-${ currentNews._id }`]);
    formData.append("image", insideFiles[0]);
    setUploading(true);

    try {
      const updateResponse = await axios.put(
        `${ API_URL }/update/${ currentNews._id }`,
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
          title: "News updated successfully!",
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
    if (currentNews && currentNews._id) {
      try {
        // Set the Authorization header using the setAuthToken function
        const onDeleteToken = localStorage.getItem("jwtToken");
        setAuthToken(onDeleteToken);

        const deleteResponse = await axios.delete(
          `${ API_URL }/delete/${ currentNews._id }`
        );

        if (!deleteResponse.data.success) {
          console.log("deleteResponse:", deleteResponse);
          console.log("deleteResponse.data:", deleteResponse.data);
        } else {
          // Successful Response
          window.scrollTo({top: 0, behavior: "instant"});
          Swal.fire({
            icon: "success",
            title: "News deleted successfully!",
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
            title: "An error occurred while deleting the news.",
            didClose: () => window.scrollTo({top: 0, behavior: "instant"}),
          });
          console.log(error.response.data.errors);
        } else {
          console.error(error);
        }
      }
    } else {
      console.error("currentNews or currentNews._id is undefined");
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
          <div className="container-fluid row container-news1-CSS">
            <h1 className="h1-news-CSS">MERN-Society-CMS News</h1>
          </div>
        </>
      )}
      {isAdmin() && (
        <>
          <div className="container-fluid row container-news2-CSS">
            <h1 className="h1-news-CSS">MERN-Society-CMS News</h1>
            <Form
              className="form-news-CSS"
              onSubmit={handleSubmitOutside(onSubmit)}
              method="post"
              encType="multipart/form-data"
            >
              <Row>
                <Col lg={6}>
                  <FloatingLabel className="news-label-CSS" label="Title">
                    <Form.Control
                      className="news-text-CSS"
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
                    <span className="news-span-CSS" role="alert">
                      {errorsOutside.title.message}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  ) : serverErrorsOutside.title && (
                    <span className="news-span-CSS" role="alert">
                      {serverErrorsOutside.title}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={6}>
                  <FloatingLabel className="news-label-CSS" label="Date">
                    <Form.Control
                      className="news-text-CSS"
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
                    <span className="news-span-CSS" role="alert">
                      {errorsOutside.date.message}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  ) : serverErrorsOutside.date && (
                    <span className="news-span-CSS" role="alert">
                      {serverErrorsOutside.date}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={12}>
                  <FloatingLabel
                    className="news-label-CSS"
                    label="Description"
                  >
                    <Form.Control
                      className="news-text-CSS"
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
                    <span className="news-span-CSS" role="alert">
                      {errorsOutside.description.message}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  ) : serverErrorsOutside.description && (
                    <span className="news-span-CSS" role="alert">
                      {serverErrorsOutside.description}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  )}
                  <br />
                  <br />
                </Col>
                <Col lg={12}>
                  <FloatingLabel className="news-label-CSS" label="Link (Optional)">
                    <Form.Control
                      className="news-text-CSS"
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
                    <span className="news-span-CSS" role="alert">
                      {errorsOutside.link.message}
                      <AiFillExclamationCircle className="alert-news-CSS" />
                    </span>
                  ) : serverErrorsOutside.link && (
                    <span className="news-span-CSS" role="alert">
                      {serverErrorsOutside.link}
                      <AiFillExclamationCircle className="alert-news-CSS" />
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
                      <div {...getOutsideRootProps({className: "news-dropzone-CSS"})}>
                        <Form.Control
                          className="news-text-CSS"
                          name="image"
                          type="file"
                          defaultValue={[]}
                          {...getOutsideInputProps()}
                          {...registerOutside("image")}
                        />
                        <p className="news-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      </div>
                      <br />
                      <aside className="news-area-preview-CSS">
                        {displayOutside}
                      </aside>
                      <br />
                      <br />
                    </>
                  ) : (
                    <>
                      {uploading ? (
                        <div className="container-fluid text-center uploading-news-CSS">
                          <Spinner animation="grow" variant="primary" />
                          <h1 className="uploading-news-spinner-CSS">Uploading...</h1>
                        </div>
                      ) : (
                        <p className="news-label-CSS">
                          Drag & drop files here or click here to select files.
                        </p>
                      )}
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Button className="submit-news-button-CSS" type="submit">
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <div className="news-line-CSS"></div>
        </>
      )}

      {loading ? (
        <div className="container-fluid text-center loading-news-CSS">
          <Spinner animation="grow" variant="primary" />
          <h1 className="loading-news-spinner-CSS">Please wait...</h1>
        </div>
      ) : (
        <>
          {isAdmin() ? (
            <>
              <br />
              <br />
              <div className="container-fluid row text-center news-search-box-CSS">
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
                  className="news-clear-search-button-CSS"
                  onClick={handleClearSearch}
                >
                  Clear Search Result
                </Button>
                {searchQuery && (
                  <h1 className="news-search-box-result-CSS">
                    Search Result: {searchQuery}
                  </h1>
                )}
              </div>
              <div className="container-fluid row text-center section1-news-CSS">
                {newsList.length > 0 ? (
                  newsList.map((news) => (
                    <div className="col-xl-4" key={news._id}>
                      <Card>
                        <Card.Img
                          src={
                            news.image ||
                            news.metadata["image"] ||
                            news.metadata["og:image"] ||
                            newsImage
                          }
                        />
                        <Card.Body>
                          <Card.Title className="news-title-CSS">
                            {news.title}
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted news-date-CSS">
                            {DateTime.fromISO(news.date).toFormat("dd/MM/yyyy")}
                          </Card.Subtitle>
                          <Row>
                            <Button
                              className="news-button1-CSS"
                              onClick={() => handleShowModalUpdateNews(news)}
                            >
                              Edit
                            </Button>
                            <Button
                              className="news-button2-CSS"
                              onClick={() => handleShowModalDelete(news)}
                            >
                              Delete
                            </Button>
                          </Row>
                          <br />
                          <br />
                          <Button
                            className="news-button1-CSS"
                            onClick={() => handleShowModalReadNews(news)}
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
                    {searchQuery && newsList.length === 0 ? (
                      <h1 className="news-search-box-result-CSS">
                        No Search Results.
                      </h1>
                    ) : (
                      <>
                        {!searchQuery && newsList.length === 0 && (
                          <h1 className="news-search-box-result-CSS">
                            No Updated News.
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
                            handleNewsPageChange(page);
                          }}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                  </Pagination>
                </div>
              </div>
              <Modal show={showModalUpdateNews} onHide={handleCloseModalNews}>
                <Form
                  className="row form-news-CSS"
                  onSubmit={handleSubmitInside(onUpdate)}
                  method="post"
                  encType="multipart/form-data"
                >
                  <Modal.Title className="title-news-modal-CSS">
                    Update News Form:
                  </Modal.Title>
                  <Modal.Body>
                    <FloatingLabel className="news-label-CSS" label="Title">
                      <Form.Control
                        className="news-text-CSS"
                        name={`title-${ currentNews._id }`}
                        type="text"
                        placeholder="Title"
                        defaultValue={currentNews.title}
                        aria-invalid={errorsInside.title ? "true" : "false"}
                        {...registerInside(`title-${ currentNews._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.title && (
                      <span className="news-span-CSS" role="alert">
                        {serverErrorsInside.title}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="news-label-CSS" label="Date">
                      <Form.Control
                        className="news-text-CSS"
                        name={`date-${ currentNews._id }`}
                        type="text"
                        placeholder="Date"
                        defaultValue={DateTime.fromISO(currentNews.date).toFormat("dd/MM/yyyy")}
                        pattern="^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$"
                        aria-invalid={errorsInside.date ? "true" : "false"}
                        {...registerInside(`date-${ currentNews._id }`, {
                          pattern: {
                            value: /^(?!3[2-9]|00|02-3[01]|04-31|06-31|09-31|11-31)[0-3][0-9]\/(?!1[3-9]|00)[01][0-9]\/(19\d\d|20\d\d|2100)$/,
                            message:
                              "*Please enter the date in the format of (dd/MM/yyyy).*",
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`date-${ currentNews._id }`] ? (
                      <span className="news-span-CSS" role="alert">
                        {errorsInside[`date-${ currentNews._id }`].message}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    ) : serverErrorsInside.date && (
                      <span className="news-span-CSS" role="alert">
                        {serverErrorsInside.date}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel
                      className="news-label-CSS"
                      label="Description"
                    >
                      <Form.Control
                        className="news-text-CSS"
                        style={{height: "350px"}}
                        name={`description-${ currentNews._id }`}
                        as="textarea"
                        placeholder="Description"
                        defaultValue={currentNews.description}
                        aria-invalid={
                          errorsInside.description ? "true" : "false"
                        }
                        {...registerInside(`description-${ currentNews._id }`, {
                          required: false,
                        })}
                      />
                    </FloatingLabel>
                    {serverErrorsInside.description && (
                      <span className="news-span-CSS" role="alert">
                        {serverErrorsInside.description}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    )}
                    <br />
                    <br />
                    <FloatingLabel className="news-label-CSS" label="Link">
                      <Form.Control
                        className="news-text-CSS"
                        name={`link-${ currentNews._id }`}
                        type="url"
                        placeholder="Link"
                        defaultValue={currentNews.link}
                        aria-invalid={errorsInside.link ? "true" : "false"}
                        {...registerInside(`link-${ currentNews._id }`, {
                          required: false,
                          pattern: {
                            value:
                              /^(https?|ftp):\/\/([^\s/?.#-]+-?[^\s/?.#-]*\.?)+(\/[^\s]*)?$/i,
                            message: "*Please enter a valid URL.*",
                          },
                        })}
                      />
                    </FloatingLabel>
                    {errorsInside[`link-${ currentNews._id }`] ? (
                      <span className="news-span-CSS" role="alert">
                        {errorsInside[`link-${ currentNews._id }`].message}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    ) : serverErrorsInside.link && (
                      <span className="news-span-CSS" role="alert">
                        {serverErrorsInside.link}
                        <AiFillExclamationCircle className="alert-news-CSS" />
                      </span>
                    )}
                    <br />
                    {!uploading ? (
                      <>
                        <div {...getInsideRootProps({className: "news-dropzone-CSS"})}>
                          <Form.Control
                            className="news-text-CSS"
                            name="image"
                            type="file"
                            defaultValue={[]}
                            {...getInsideInputProps()}
                            {...registerOutside("image")}
                          />
                          <p className="news-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        </div>
                        <br />
                        <aside className="news-area-preview-CSS">
                          {displayInside}
                        </aside>
                        <br />
                        <br />
                      </>
                    ) : (
                      <>
                        {uploading ? (
                          <div className="container-fluid text-center uploading-news-CSS">
                            <Spinner animation="grow" variant="primary" />
                            <h1 className="uploading-news-spinner-CSS">Uploading...</h1>
                          </div>
                        ) : (
                          <p className="news-label-CSS">
                            Drag & drop files here or click here to select files.
                          </p>
                        )}
                      </>
                    )}
                    <br />
                  </Modal.Body>
                  <div>
                    <Button
                      className="news-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalNews}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="news-save-button-CSS"
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
                  className="row form-news-CSS"
                  onSubmit={handleSubmitInside(onDelete)}
                  method="post"
                >
                  <Modal.Title className="title-news-modal-CSS">
                    Delete News:
                  </Modal.Title>
                  <br />
                  <br />
                  <Modal.Body>
                    <h3>Permanently delete {currentNews.title} are you sure?</h3>
                  </Modal.Body>
                  <div>
                    <Button
                      className="news-cancel-button-CSS"
                      variant="secondary"
                      onClick={handleCloseModalDelete}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="news-delete-button-CSS"
                      variant="danger"
                      type="submit"
                    >
                      Delete
                    </Button>
                  </div>
                </Form>
              </Modal>

              <Modal show={showModalReadNews} onHide={handleCloseModalNews}>
                <div className="read-news-CSS">
                  <Card>
                    <Card.Img
                      src={
                        currentNews.image ||
                        (currentNews.metadata && currentNews.metadata["image"]) ||
                        (currentNews.metadata && currentNews.metadata["og:image"]) ||
                        newsImage
                      }
                    />
                    <Card.Body>
                      <Card.Title className="news-title-CSS">
                        {currentNews.title}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted news-date-CSS">
                        {DateTime.fromISO(currentNews.date).toFormat("dd/MM/yyyy")}
                      </Card.Subtitle>
                      <Card.Text className="news-description-CSS">
                        {currentNews.description}
                      </Card.Text>
                      {currentNews.link && (
                        <Button
                          className="news-link-button-CSS"
                          href={currentNews.link}
                          target="_blank"
                        >
                          More Information!
                        </Button>
                      )}
                      <div>
                        <Button
                          className="news-cancel-button-CSS"
                          variant="secondary"
                          onClick={handleCloseModalNews}
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
              <div className="container-fluid row text-center news-search-box-CSS">
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
                  className="news-clear-search-button-CSS"
                  onClick={handleClearSearch}
                >
                  Clear Search Result
                </Button>
                {searchQuery && (
                  <h1 className="news-search-box-result-CSS">
                    Search Result: {searchQuery}
                  </h1>
                )}
              </div>
              <div className="container-fluid row text-center section1-news-CSS">
                {newsList.length > 0 ? (
                  newsList.map((news) => (
                    <div className="col-xl-4" key={news._id}>
                      <Card>
                        <Card.Img
                          src={
                            news.image ||
                            news.metadata["image"] ||
                            news.metadata["og:image"] ||
                            newsImage
                          }
                        />
                        <Card.Body>
                          <Card.Title className="news-title-CSS">
                            {news.title}
                          </Card.Title>
                          <Card.Subtitle className="mb-2 text-muted news-date-CSS">
                            {DateTime.fromISO(news.date).toFormat("dd/MM/yyyy")}
                          </Card.Subtitle>
                          <br />
                          <br />
                          <Button
                            className="news-button1-CSS"
                            onClick={() => handleShowModalGuestReadNews(news)}
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
                    {searchQuery && newsList.length === 0 ? (
                      <h1 className="news-search-box-result-CSS">
                        No Search Results.
                      </h1>
                    ) : (
                      <>
                        {!searchQuery && newsList.length === 0 && (
                          <h1 className="news-search-box-result-CSS">
                            No Updated News.
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
                            handleNewsPageChange(page);
                          }}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                  </Pagination>
                </div>
              </div>

              <Modal show={showModalReadNews} onHide={handleCloseModalNews}>
                <div className="read-news-CSS">
                  <Card>
                    <Card.Img
                      src={
                        currentNews.image ||
                        (currentNews.metadata && currentNews.metadata["image"]) ||
                        (currentNews.metadata && currentNews.metadata["og:image"]) ||
                        newsImage
                      }
                    />
                    <Card.Body>
                      <Card.Title className="news-title-CSS">
                        {currentNews.title}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted news-date-CSS">
                        {DateTime.fromISO(currentNews.date).toFormat("dd/MM/yyyy")}
                      </Card.Subtitle>
                      <Card.Text className="news-description-CSS">
                        {currentNews.description}
                      </Card.Text>
                      {currentNews.link && (
                        <Button
                          className="news-link-button-CSS"
                          href={currentNews.link}
                          target="_blank"
                        >
                          More Information!
                        </Button>
                      )}
                      <div>
                        <Button
                          className="news-cancel-button-CSS"
                          variant="secondary"
                          onClick={handleCloseModalNews}
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

export default News;
