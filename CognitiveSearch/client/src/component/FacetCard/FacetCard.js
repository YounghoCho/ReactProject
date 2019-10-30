import React, { Component } from 'react';
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List, Checkbox, Tag} from "antd";
import "./FacetCard.css";

const title1st = "기술요소";
const title2nd = "적용산업";
const title3rd = "응용분야";

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
            onFacetQuery, currentCollectionDocCount            
        } = this.props;
        return(
            <Card
            className={classNames("FacetCard", className)}
            title={title + "" + (currentCollectionDocCount !== 0 ? " (전체:" + currentCollectionDocCount + "건)" : "")}
            bodyStyle={{ overflow: "scroll", height: "calc(100% - 56px)" }}
        >
            <div style={{fontWeight:'bold', fontSize:'1.2em', width:'100%',textAlign:'center'}}>
             AI Technology 관점
            </div>
            <List
             size="small"
             header={<Tag color='green' style={{padding:'5px'}} id={'listHeader1'}>{title1st}</Tag>}
             itemLayout="horizontal"
             loading={isLoading}
             dataSource={data.slice(0,10)}   //data is FacetFields from App.js
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
                                        <div id="chartDiv" className="charDiv1" style={{width:item.size}}>
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
             header={<Tag color='orange' style={{padding:'5px'}} id={'listHeader2'}>{title2nd}</Tag>}
             itemLayout="horizontal"
             loading={isLoading}
             dataSource={data.slice(10,20)}
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
                                        <div id="chartDiv" className="charDiv2" style={{width:item.size}}>
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
             header={<Tag color='purple' style={{padding:'5px'}} id={'listHeader3'}>{title3rd}</Tag>}
             itemLayout="horizontal"
             loading={isLoading}
             dataSource={data.slice(20,30)}
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
                                        <div id="chartDiv" className="charDiv3" style={{width:item.size}}>
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
