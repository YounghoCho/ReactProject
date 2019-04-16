import React from "react";
import PropTypes from "prop-types";
import { List, Avatar } from "antd";

import "./BasicRow.css";

const BasicRow = ({ title, body, highlighting, onClick, index, style }) => (
  <List.Item
    className="BasicRow"
    style={{
      ...style
    }}
    onClick={onClick}
  >
    <List.Item.Meta
      avatar={
        <Avatar className="BasicRow-avatar" size="large">
          {index}
        </Avatar>
      }
      title={title.length < 100 ? title : title.slice(0, 100) + "..."}
      description={
        highlighting ? (
          <div
            dangerouslySetInnerHTML={{
              __html: `${
                highlighting.length < 500
                  ? highlighting
                  : highlighting.slice(0, 500) + "..."
              }`
            }}
          />
        ) : body.length < 500 ? (
          body
        ) : (
          body.slice(0, 500) + "..."
        )
      }
    />
  </List.Item>
);

BasicRow.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  highlighting: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClick: PropTypes.func,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

BasicRow.defaultProps = {
  title: "",
  body: "",
  highlighting: "",
  onClick: () => {},
  index: 0
};

export default BasicRow;
