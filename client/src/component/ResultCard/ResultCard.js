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
    if(element.current) //if문 없으면 current가 뭐냐고하면서 에러남. 이 자체구문은 react element 검색해서 보기.
      this.cardBody = element.current.childNodes[1];
  };

  handlePageChange = page => {
    this.setState({
      currentPage: page
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.currentPage !== this.state.currentPage && this.cardBody) {
      this.cardBody.scrollTop = 0;
    }
    // if the query results(documents) were loaded from server, set current page to 0
    if (prevProps.isLoading && !this.props.isLoading) {
      this.setState({
        currentPage: 1
      });
    }
  };

  render() {
    const {
      className,
      title,
      data,
      isLoading,
      onClickDocument,
      pageSize,
      renderRow //queryMode에 따라 wordCloud와 Doc 본문을 그리는 함수(App.js)
    } = this.props;
    const { currentPage } = this.state;
    const documentCount = data.length;
    const partialData = data.slice(
      pageSize * (currentPage - 1),
      pageSize * currentPage
    );

    return (
      <Card
        className={classNames("ResultCard", className)}
        title={`${title} (Top ${documentCount})`}
        bodyStyle={{
          overflow: "scroll",
          height: "calc(100% - 110.5px)",
          padding: "8px 24px"
        }}
        ref={this.setCardRef}
        actions={[
          <Pagination //pages
            size="small"
            total={documentCount}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            pageSize={pageSize}
            current={currentPage}
            onChange={this.handlePageChange}
          />
        ]}
      >
        <List
          itemLayout="horizontal"
          loading={isLoading}
          dataSource={partialData} //antd 예제를 보면 DataSource에 들어온 data들은 각각 1개씩이 renderItem에 인자로 들어간다.
          renderItem={renderRow(onClickDocument)} //onClickDocument함수를 인자로 받는데 이 함수는 handleDocumentClick(App.js)를 호출하고 setState로 api로 받아온 document를 갱신한다.
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
