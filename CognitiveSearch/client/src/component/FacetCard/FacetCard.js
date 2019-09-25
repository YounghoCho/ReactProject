import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List } from "antd";
import FacetContainer from "../FacetContainer";
import "./FacetCard.css";

let title1st = "기술요소";
let title2nd = "적용산업";
let title3rd = "응용분야";

const FacetCard = ({ className, title, data, isLoading, queryData, onClickQuery, currentCollectionDocCount }) => (
    <Card
        className={classNames("FacetCard", className)}
        title={title + " (전체 문서 수 : " + currentCollectionDocCount + ")"}
        // title={queryData}
        bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
    >
        <List
         size="small"
         header={<div id={'listHeader1'}>{title1st}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(0,5)}
         renderItem={item => (
            <List.Item style={{border:'none',cursor:'pointer'}}
                onClick={onClickQuery.bind(
                    this,
                    0,
                    queryData,
                    1,
                    item.substr(0, item.indexOf(':')-1)
                )}
            >
                    {item.substr(item.length-1, item.length) == 0 ?
                            (item.substr(item.length-2, item.length) > 0 ? item : '')
                            : item}
            </List.Item>
          )}
        />
        <List
        size="small"
         header={<div id={'listHeader2'}>{title2nd}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(5,10)}
         renderItem={item => (
             <List.Item style={{border:'none',cursor:'pointer'}}
                onClick={onClickQuery.bind(
                    this,
                    0,
                    queryData,
                    1,
                    item.substr(0, item.indexOf(':')-1)
                )}
            >
                {item.substr(item.length-1, item.length) == 0 ?
                    (item.substr(item.length-2, item.length) > 0 ? item : '')
                    : item}
            </List.Item>
          )}
        />
        <List
        size="small"
         header={<div id={'listHeader3'}>{title3rd}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(10,15)}
         renderItem={item => (
             <List.Item style={{border:'none',cursor:'pointer'}}
        onClick={onClickQuery.bind(
                    this,
                    0,
                    queryData,
                    1,
                    item.substr(0, item.indexOf(':')-1)
                )}
            >
                {item.substr(item.length-1, item.length) == 0 ?
                    (item.substr(item.length-2, item.length) > 0 ? item : '')
                    : item}
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
