// module imports
import React from "react";
import PropTypes from "prop-types";
import { Tag, Icon } from "antd";

// static file imports
import "./RankerResultContainer.css";

const RankerResultContainer = ({ rank, message }) => {
  return (
    <div className="RankerResultContainer">
      <div className="RankerResultContainer-side">
        
      </div>
      <div className="RankerResultContainer-body">
        {message}
      </div>
    </div>
  );
};

RankerResultContainer.propTypes = {
  probability: PropTypes.number.isRequired,
  label: PropTypes.string
};

RankerResultContainer.defaultProps = {
  probability: 0,
  label: "not available"
};

export default RankerResultContainer;
