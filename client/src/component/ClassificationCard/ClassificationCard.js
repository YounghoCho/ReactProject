import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List } from "antd";
import ClassifierResultContainer from "../ClassifierResultContainer";
import "./ClassificationCard.css";

const ClassificationCard = ({ className, title, data, isLoading }) => (
  <Card
    className={classNames("ClassificationCard", className)}
    title={title}
    bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
  >
    <List
      itemLayout="horizontal"
      loading={isLoading}
      dataSource={data}
      renderItem={item => (
        <ClassifierResultContainer
          key={`${item.probability}-${item.label}`}
          label={item.label}
          probability={item.probability}
        />
      )}
    />
  </Card>
);

ClassificationCard.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  isLoading: PropTypes.bool
};

ClassificationCard.defaultProps = {
  title: "Classification",
  data: [],
  isLoading: false
};

export default ClassificationCard;
