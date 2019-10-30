import React from "react";
import PropTypes from "prop-types";
import BasicRow from "../BasicRow";
import WordCloud from "../../WordCloud";
import "./WordCloudRow.css";

const WordCloudRow = ({ data, data2, data3, title, body, highlighting, onClick,
                          keyword, author, journalTitle, publisher, yearOfPublication, handleSendQuery}) => (
  <div className="WordCloudRow">
    <BasicRow
      title={title}
      body={body}
      highlighting={highlighting}
      onClick={onClick}
      author={author}
      publisher={publisher}
      yearOfPublication={yearOfPublication == null ? '' : yearOfPublication.toString().substr(0,10)}
    />
    <WordCloud width={"100%"} height={"100%"} data={data} data2={data2} data3={data3} handleSendQuery={handleSendQuery}/>
    {/*<Descriptions bordered>*/}
        {/*<Descriptions.Item label="작성자" span={3}>{author}</Descriptions.Item>*/}
        {/*<Descriptions.Item label="발행처" span={3}>{publisher}</Descriptions.Item>*/}
        {/*<Descriptions.Item label="발행년도" span={3}>{yearOfPublication}</Descriptions.Item>*/}
    {/*</Descriptions>*/}
 </div>
);

WordCloudRow.propTypes = {
  data: PropTypes.array,
  title: PropTypes.array,
  body: PropTypes.array,
  highlighting: PropTypes.string,
  onClick: PropTypes.func,
  index: PropTypes.number
};

WordCloudRow.defaultProps = {
  data: [],
  title: [],
  body: [],
  highlighting: <span />,
  onClick: () => {},
  index: 0
};

export default WordCloudRow;
