import React from "react";
import PropTypes from "prop-types";
import { List, Tag } from "antd";

import "./BasicRow.css";

const BasicRow = ({ title, body, highlighting, onClick, style,
                      author, publisher, yearOfPublication}) => (
  <div>
    <List.Item
        className="BasicRow"
        style={{
            ...style,
            cursor:'pointer',
            border: 'none'
        }}
        onClick={onClick}
    >
        <List.Item.Meta
            title={<p style={{'font-weight':'bold','font-size':'18px'}}>{title.length < 100 ? title : title.slice(0, 100) + "..."}</p>}
            description={
                highlighting ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: `${
                                highlighting.length < 1200
                                    ? highlighting
                                    : highlighting.slice(0, 1000) + "..."
                                }`
                        }}
                    />
                ) : body.toString().length < 1000 ? (
                    body
                ) : (
                    body.toString().slice(0, 1000) + "..."
                )
            }
        />

    </List.Item>
      <div>
          {author ? `${author} / ` : null}{publisher ? `${publisher} / ` : null}{yearOfPublication ? `${yearOfPublication}` : null}
      </div>
  </div>

);

BasicRow.propTypes = {
    title: PropTypes.array,
    body: PropTypes.array,
    highlighting: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    onClick: PropTypes.func,
    index: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

BasicRow.defaultProps = {
    title: [],
    body: [],
    highlighting: "",
    onClick: () => {},
    index: 0
};

export default BasicRow;
