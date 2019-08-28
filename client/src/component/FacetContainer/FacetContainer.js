// module imports
import React from "react";
import PropTypes from "prop-types";
import { Tag } from "antd";

// static file imports
import "./FacetContainer.css";

const GREEN = "rgb(165,206,91)";
const ORANGE = "rgb(238,191,45)";
const RED = "rgb(220,43,3)";

const FacetContainer = ({ author, onClick }) => {
    return (
        <div className="FacetContainer" onClick={onClick}>
            <div className="FacetContainer-body">
                <div className="FacetContainer-progressbar-text">
                    prob is  :
                    <span>nothing</span>
                </div>
                <div className="FacetContainer-progressbar">
                    <div style={{
                        height: "100%",
                        width: "80%"
                    }}/>
                </div>
                <div>
                    <Tag color="orange">여기가 패싯 : {author}</Tag>
                </div>
            </div>
        </div>
    );
};

FacetContainer.propTypes = {
    author: PropTypes.string
};

FacetContainer.defaultProps = {
    author: "no authors"
};

export default FacetContainer;
