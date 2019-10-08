import React, { Component } from 'react';
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List, Checkbox} from "antd";
import "./FacetCard.css";

const title1st = "기술요소";
const title2nd = "적용산업";
const title3rd = "응용분야";

const style = {
    'checked' : true    
}
//비구조 할당 함수형 컴포넌트
class FacetCard extends Component {
    constructor(props){
        super(props);
        this.state = ({
        });
    }
    render(){
        const{
            className, title, data, isLoading, queryData, 
            onFacetQuery, currentCollectionDocCount, FacetCheckHistory            
        } = this.props;
        return(
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
                >
                    <List.Item.Meta
                        description={
                            <div id="facetBlock">
                                {item.count !== 0 ?
                                (
                                <React.Fragment>
                                    <div id="valueBlock">
                                        <Checkbox checked={item.check} onChange={onFacetQuery.bind(
                                            this,
                                            queryData,
                                            'annotation.unstructure.tech:"' + item.value.trim() + '"',
                                            item.value.trim()   //To be pushed into FacetCheckHistory Array
                                        )}>
                                            {item.value} {item.check}
                                        </Checkbox>
                                    </div>
                                    <div id="countBlock">
                                        <div id="chartDiv" style={{width:item.size}}>
                                            <font color='white'>&nbsp;{item.count}</font>
                                        </div>
                                    </div>
                                </React.Fragment>
                                ):(
                                ''
                                )}
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
                >
                    <List.Item.Meta
                        description={
                            <div id="facetBlock">
                                {item.count !== 0 ?
                                (
                                <React.Fragment>
                                    <div id="valueBlock">
                                        <Checkbox checked={item.check} onChange={onFacetQuery.bind(
                                            this,
                                            queryData,
                                            'annotation.unstructure.industry:"' + item.value.trim() + '"',
                                            item.value.trim()   //To be pushed into FacetCheckHistory Array
                                        )}>
                                            {item.value} {item.check}
                                        </Checkbox>
                                    </div>
                                    <div id="countBlock">
                                        <div id="chartDiv" style={{width:item.size}}>
                                            <font color='white'>&nbsp;{item.count}</font>
                                        </div>
                                    </div>
                                </React.Fragment>
                                ):(
                                ''
                                )}
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
                >
                    <List.Item.Meta
                        description={
                            <div id="facetBlock">
                                {item.count !== 0 ?
                                (
                                <React.Fragment>
                                    <div id="valueBlock">
                                        <Checkbox checked={item.check} onChange={onFacetQuery.bind(
                                            this,
                                            queryData,
                                            'annotation.unstructure.application:"' + item.value.trim() + '"',
                                            item.value.trim()   //To be pushed into FacetCheckHistory Array
                                        )}>
                                            {item.value} {item.check}
                                        </Checkbox>
                                    </div>
                                    <div id="countBlock">
                                        <div id="chartDiv" style={{width:item.size}}>
                                            <font color='white'>&nbsp;{item.count}</font>
                                        </div>
                                    </div>
                                </React.Fragment>
                                ):(
                                ''
                                )}
                            </div>
                        }
                    />
    
                </List.Item>
              )}
            />
    </Card>
        );
    }
}
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
