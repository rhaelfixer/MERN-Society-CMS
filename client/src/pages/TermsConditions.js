import React from "react";
import "bootstrap/dist/css/bootstrap.css";


// CSS
import "./styles/TermsConditions.css";


const TermsConditions = () => {
  return (
    <>
      <div className="container-fluid container-termsconditions-CSS">
        <h1 className="termsconditions-h1-CSS">Terms & Conditions.</h1>
        <p className="termsconditions-p-CSS">
          Membership of the MERN-Society-CMS is open to those involved in various
          sectors across the supply chain, including: Technologists, Buyers,
          Brand Managers, Marketing Executives, Brand Owners, Production Managers,
          Sales Representatives, Specification Managers, Designers, Supply Chain
          Specialists, Engineers and students across different courses. These
          members can come from various industry segments, including Retail, Supplier
          and more.
        </p>
        <p className="termsconditions-p-CSS">
          We are interested in all types of products, across diverse sectors including:
          Food & Drink, Cosmetics and Toiletries, Pharmaceutical and Medical Devices
          and Industrial.
        </p>
        <p className="termsconditions-p-CSS">
          The MERN-Society-CMS is a not-for-profit society.
        </p>
      </div>
    </>
  );
};

export default TermsConditions;
