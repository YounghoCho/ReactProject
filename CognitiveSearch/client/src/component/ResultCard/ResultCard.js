import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { Card, List, Pagination } from "antd";

import "./ResultCard.css";

class ResultCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1
    };
  }

  setCardRef = element => {
    if(element.current){
      this.cardBody = element.current.childNodes[1];
    }
  };

  handlePageChange = page => {
    this.setState({
      currentPage: page
    });
    this.props.getNextPage(page);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.currentPage !== this.state.currentPage && this.cardBody) {
      this.cardBody.scrollTop = 0;
    }
    // if the query results(documents) were loaded from server, set current page to 0
    if (prevProps.isLoading && !this.props.isLoading) {
      this.setState({
        currentPage: this.props.pageNow //페이지를 고정시키는 비밀
      });
    }
  };

  render() {
    const {
      className,
      title,
      data,
      docsCount,
      isLoading,
      onClickDocument,
      pageSize,
      renderRow,
      pageNow
    } = this.props;
 
    const { currentPage } = this.state;
    // const documentCount = data.length;
    const documentCount = docsCount;
    // const partialData = data.slice(
    //   pageSize * (currentPage - 1),
    //   pageSize * currentPage
    // );
    const partialData = data;
    return (
      <Card
        className={classNames("ResultCard", className)}
        title={`${title} : ${documentCount} 건`}
        bodyStyle={{
          overflow: "scroll",
          height: "calc(100% - 110.5px)",
          padding: "8px 24px"
        }}
        ref={this.setCardRef}
        actions={[
          <Pagination
            size="small"
            total={documentCount}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            pageSize={pageSize}
            current={currentPage}
            // onChange={this.handlePageChange.bind(this, test)}
            onChange={this.handlePageChange}
            />
        ]}
      >
        <List
          itemLayout="horizontal"
          loading={isLoading}
          dataSource={partialData}
          renderItem={renderRow(onClickDocument)}
        />
      </Card>
    );
  }
}

ResultCard.propTypes = {
  mode: PropTypes.string,
  title: PropTypes.string,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  onClickDocument: PropTypes.func,
  pageSize: PropTypes.number,
  renderRow: PropTypes.func.isRequired
};

ResultCard.defaultProps = {
  data: [],
  title: "Results",
  isLoading: false,
  onClickDocument: () => {},
  pageSize: 10,
  renderRow: () => <div />
};

export default ResultCard;
