// module imports
import React from "react";
import PropTypes from "prop-types";
import {List, Tag} from "antd";

// static file imports
import "./FacetContainer.css";

// const GREEN = "rgb(165,206,91)";
// const ORANGE = "rgb(238,191,45)";
// const RED = "rgb(220,43,3)";

let title1st = "기술요소";
let title2nd = "적용산업";
let title3rd = "응용분야";
let title4th = "주제어";

const FacetContainer = ({ eachData }) => {
    return (
        <div className="ClassifierResultContainer">
            <div className="ClassifierResultContainer-body">
                <List
                    size="small"
                    header={<div id={'listHeader'}>{title1st}</div>}
                    itemLayout="horizontal"
                    dataSource={eachData.slice(0,3)}
                    renderItem={item => (
                    <List.Item>
                    {'  ' + item}
                    </List.Item>
                    )}
                />
                <List
                    size="small"
                    header={<div id={'listHeader'}>{title2nd}</div>}
                    itemLayout="horizontal"
                    dataSource={eachData.slice(3,6)}
                    renderItem={item => (
                    <List.Item>
                    {'  ' + item}
                    </List.Item>
                     )}
                />
                <List
                    size="small"
                    header={<div id={'listHeader'}>{title3rd}</div>}
                    itemLayout="horizontal"
                    dataSource={eachData.slice(6,9)}
                    renderItem={item => (
                    <List.Item>
                    {'  ' + item}
                    </List.Item>
                       )}
                />
                <List
                    size="small"
                    header={<div id={'listHeader'}>{title4th}</div>}
                    itemLayout="horizontal"
                    dataSource={eachData.slice(9,12)}
                    renderItem={item => (
                    <List.Item>
                    {'  ' + item}
                    </List.Item>
                   )}
                />
            </div>
        </div>

    );
};

FacetContainer.propTypes = {
    eachData: PropTypes.array
};

FacetContainer.defaultProps = {
    eachData: []
};

export default FacetContainer;
