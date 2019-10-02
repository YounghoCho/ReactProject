import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List, Checkbox} from "antd";
import "./FacetCard.css";

let title1st = "기술요소";
let title2nd = "적용산업";
let title3rd = "응용분야";

const FacetCard = ({ className, title, data, isLoading, queryData, onClickQuery, currentCollectionDocCount }) => (
    <Card
        className={classNames("FacetCard", className)}
        title={title + "" + (currentCollectionDocCount !== 0 ? " (전체:" + currentCollectionDocCount + "건)" : "")}
        bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
    >
        <List
         size="small"
         header={<div id={'listHeader1'}>{title1st}</div>}
         itemLayout="horizontal"
         loading={isLoading}
         dataSource={data.slice(0,5)}   //data is FacetFields from App.js
         renderItem={item => (
            <List.Item style={{border:'none',cursor:'pointer'}}
                // onClick={onClickQuery.bind(
                //     this,
                //     0,
                //     queryData,
                //     1,
                //     'annotation.unstructure.tech:"' + item.substr(0, item.indexOf(':')-1) + '"'
                // )}
            >
                <List.Item.Meta
                    description={
                        <div id="facetBlock">
                            <div id="valueBlock">
                                <Checkbox onChange={''}>
                                    {item.count == '0' ? '' : item.value}
                                </Checkbox>
                            </div>
                            <div id="countBlock">
                                <div id="chartDiv" style={{width:item.count}}/>
                            </div>
                        </div>
                    }
                />

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
                // onClick={onClickQuery.bind(
                //     this,
                //     0,
                //     queryData,
                //     1,
                //     'annotation.unstructure.industry:"' + item.substr(0, item.indexOf(':')-1) + '"'
                // )}
            >
                 <List.Item.Meta
                     description={
                         <div id="facetBlock">
                             <div id="valueBlock">
                                 <Checkbox onChange={''}>
                                     {item.count == 0 ? '' : item.value}
                                 </Checkbox>
                             </div>
                             <div id="countBlock">
                                 {item.count}
                             </div>
                         </div>
                     }
                 />
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
        // onClick={onClickQuery.bind(
        //             this,
        //             0,
        //             queryData,
        //             1,
        //             'annotation.unstructure.application:"' + item.substr(0, item.indexOf(':')-1) + '"'
        //         )}
            >
                 <List.Item.Meta
                     description={
                         <div id="facetBlock">
                             <div id="valueBlock">
                                 <Checkbox onChange={''}>
                                     {item.count == 0 ? '' : item.value}
                                 </Checkbox>
                             </div>
                             <div id="countBlock">
                                 {item.count}
                             </div>
                         </div>
                     }
                 />
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
