import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List } from "antd";
import FacetContainer from "../FacetContainer";
import "./FacetCard.css";

let title1st = "기술요소";
let title2nd = "적용산업";
let title3rd = "응용분야";
let title4th = "주제어";

const FacetCard = ({ className, title, data, isLoading, queryData, onClickQuery }) => (
    <Card
        className={classNames("FacetCard", className)}
        title={title}
        // title={queryData}
        bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
    >
        <List
         size="small"
         header={<div id={'listHeader'}>{title1st}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(0,3)}
         renderItem={item => (
            <List.Item style={{border:'none'}}
                onClick={onClickQuery.bind(
                    this,
                    0,
                    queryData + " AND " + item.substr(0, item.indexOf(':')-1),
                    1
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
         header={<div id={'listHeader'}>{title2nd}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(3,6)}
         renderItem={item => (
            <List.Item style={{border:'none'}}
                onClick={onClickQuery.bind(
                    this,
                    0,
                    queryData + " AND " + item.substr(0, item.indexOf(':')-1),
                    1
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
         header={<div id={'listHeader'}>{title3rd}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(6,9)}
         renderItem={item => (
        <List.Item style={{border:'none'}}
        onClick={onClickQuery.bind(
                this,
                0,
                queryData + " AND " + item.substr(0, item.indexOf(':')-1),
                1
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
         header={<div id={'listHeader'}>{title4th}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(9,12)}
         renderItem={item => (
        <List.Item style={{border:'none'}}
        onClick={onClickQuery.bind(
                this,
                0,
                queryData + " AND " + item.substr(0, item.indexOf(':')-1),
                1
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
