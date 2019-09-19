import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List } from "antd";
import FacetContainer from "../FacetContainer";
import "./FacetCard.css";

const FacetCard = ({ className, title, data, isLoading }) => (
    <Card
        className={classNames("FacetCard", className)}
        title={title}
        bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
    >
        <List
         header={<div>Author</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(0,3)}
         renderItem={item => (
            <List.Item>
              {item}
            </List.Item>
          )}
        />
        <List
         header={<div>Keyword</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(3,6)}
         renderItem={item => (
            <List.Item>
              {item}
            </List.Item>
          )}
        />
</Card>
);

FacetCard.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    isLoading: PropTypes.bool
};

FacetCard.defaultProps = {
    title: "Facet",
    data: [],
    isLoading: false
};

export default FacetCard;
