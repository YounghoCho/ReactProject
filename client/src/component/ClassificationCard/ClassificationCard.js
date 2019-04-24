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
      dataSource={data} //server/app.js에서 result.data.metadata를 App.js에서 받아온다음 classes를 이쪽으로 넘긴다.
      renderItem={item => ( //위에서 받아오 dataSource를 한개씩 item파라미터에 넣어 함수형으로 컴포넌트 리턴받는다.
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
