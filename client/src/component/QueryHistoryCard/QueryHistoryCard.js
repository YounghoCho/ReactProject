import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import classNames from "classnames/bind";
import { Card, List, Tag } from "antd";
import { i18n } from "../../lib/constant";

import "./QueryHistoryCard.css";

const QueryListItem = ({
  query,
  date,
  onClick,
  queryMode,
  isCurrent,
  collectionName
}) => {
  const queryModeTagString =
    queryMode === 0
      ? i18n.BASIC_SEARCH
      : queryMode === 1
        ? i18n.SIMILAR_DOCUMENT_SEARCH
        : i18n.PHRASAL_SEARCH;
  const queryModeTagColor =
    queryMode === 0 ? "red" : queryMode === 1 ? "cyan" : "blue";
  return (
    <div className="QueryListItem" onClick={isCurrent ? null : onClick}>
      {isCurrent && (
        <Tag color="#87d068" style={{ marginBottom: "8px" }}>
          Current
        </Tag>
      )}
      <Tag color={queryModeTagColor}>{queryModeTagString}</Tag>
      <Tag>Collection: {collectionName}</Tag>
      <div
        style={{
          fontSize: "14px",
          marginBottom: "8px",
          whiteSpace: "pre-wrap"
        }}
      >
        {query.length > 300 ? `${query.slice(0, 300)}...` : query}
      </div>
      <div className="QueryListItem-footer">
        {date}
      </div>
    </div>
  );
};

QueryListItem.propTypes = {
  query: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClick: PropTypes.func,
  queryMode: PropTypes.number,
  isCurrent: PropTypes.bool
};

QueryListItem.defaultProps = {
  query: "",
  date: 0,
  onClick: () => {},
  queryMode: 0,
  isCurrent: false
};

const QueryHistoryCard = ({
  className,
  title,
  data,
  isLoading,
  onClickQuery
}) => {
  const currentIndex = data.length - 1 || 0;
  return (
    <Card
      className={classNames("QueryHistoryCard", className)}
      loading={isLoading}
      title={title}
      bodyStyle={{
        overflow: "scroll",
        height: "calc(100% - 56px)",
        padding: "8px 16px"
      }}
    >
      <List
        dataSource={data}
        renderItem={item => {
          return (
            <QueryListItem
              query={item.query}
              date={moment(item.date).format("LLL")}
              onClick={onClickQuery.bind(
                this,
                item.index,
                item.query,
                item.queryMode
              )}
              isCurrent={currentIndex === item.index}
              queryMode={item.queryMode}
              collectionName={item.collection.name}
            />
          );
        }}
      />
    </Card>
  );
};

QueryHistoryCard.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      queryString: PropTypes.string,
      date: PropTypes.number,
      queryMode: PropTypes.number
    })
  ),
  isLoading: PropTypes.bool,
  onClickQuery: PropTypes.func
};

QueryHistoryCard.defaultProps = {
  title: "Query History",
  data: [],
  isLoading: false,
  onClickQuery: () => {}
};

export default QueryHistoryCard;
