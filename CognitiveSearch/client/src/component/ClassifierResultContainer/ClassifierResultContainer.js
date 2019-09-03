// module imports
import React from "react";
import PropTypes from "prop-types";
import { Tag } from "antd";

// static file imports
import "./ClassifierResultContainer.css";

const GREEN = "rgb(165,206,91)";
const ORANGE = "rgb(238,191,45)";
const RED = "rgb(220,43,3)";

const calcColor = probability => {
  return probability >= 70
    ? GREEN
    : probability >= 50 && probability < 70
      ? ORANGE
      : RED;
};

const ClassifierResultContainer = ({ probability, label, onClick }) => {
  const prob = Math.round(probability * 1000) / 10;
  return (
    <div className="ClassifierResultContainer" onClick={onClick}>
      <div className="ClassifierResultContainer-body">
        <div className="ClassifierResultContainer-progressbar-text">
          Probability{" "}
          <span style={{ color: `${calcColor(prob)}` }}>{prob}%</span>
        </div>
        <div className="ClassifierResultContainer-progressbar">
          <div
            style={{
              height: "100%",
              width: `calc(${prob / 100} * 100%)`,
              backgroundColor: `${calcColor(prob)}`
            }}
          />
        </div>
        <div>
          <Tag color="orange">{label}</Tag>
        </div>
      </div>
    </div>
  );
};

ClassifierResultContainer.propTypes = {
  probability: PropTypes.number.isRequired,
  label: PropTypes.string
};

ClassifierResultContainer.defaultProps = {
  probability: 0,
  label: "not available"
};

export default ClassifierResultContainer;
