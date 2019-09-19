import React from "react";
import PropTypes from "prop-types";
import BasicRow from "../BasicRow";
import WordCloud from "../../WordCloud";
import "./WordCloudRow.css";

const WordCloudRow = ({ data, title, body, highlighting, onClick, index }) => (
  <div className="WordCloudRow">
    <BasicRow
      title={title}
      body={body}
      highlighting={highlighting}
      onClick={onClick}
      index={index}
    />
    <WordCloud width={"100%"} height={"100%"} data={data} />
  </div>
);

WordCloudRow.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string,
  body: PropTypes.string,
  highlighting: PropTypes.string,
  onClick: PropTypes.func,
  index: PropTypes.number
};

WordCloudRow.defaultProps = {
  data: [],
  title: "",
  body: "",
  highlighting: <span />,
  onClick: () => {},
  index: 0
};

export default WordCloudRow;
