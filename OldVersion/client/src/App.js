// module imports
import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentCollection, fetchCollections } from "./action";
import { Layout, Modal, Spin } from "antd";
import moment from "moment";
import QueryBar from "./component/QueryBar";
import {
  QUERY_MODE_BASIC_SEARCH,
  QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
  QUERY_MODE_PHRASAL_SEARCH
} from "./component/QueryModeSelect";
import ResultCard from "./component/ResultCard";
import ClassificationCard from "./component/ClassificationCard";
import FacetCard from "./component/FacetCard";
import QueryHistoryCard from "./component/QueryHistoryCard";
import CollectionSelect from "./component/CollectionSelect";
import DocumentDetailModal from "./component/DocumentDetailModal";
import BasicRow from "./component/ResultCard/BasicRow";
import WordCloudRow from "./component/ResultCard/WordCloudRow";
import {
  fetchBasicQueryResult,
  fetchClassifierResult,
  fetchSimilarDocumentQueryResult,
  fetchPhrasalQueryResult,
  checkConnectionStatus
} from "./lib/service";
import { browserStorage } from "./lib/util";
import { i18n } from "./lib/constant";
import logo from "./logo.svg";

// static file imports
import "./App.css";
import "antd/dist/antd.css";

const { Header, Content } = Layout;

class App extends Component {
  /* React lifecycle methods */
  constructor(props) {
    super(props);
    this.state = {
      isApplicationLoading: true,
      query: "",
      queryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      nextQueryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      classificationData: [],
      isClassificationDataLoading: false,
      documents: [],
      isDocumentsLoading: false,
      facetFields: [],
      isFacetFieldsLoading : false,
      wordStats: [],
      queryHistory: [],
      selectedDocument: {
        title: "",
        body: "",
        date: ""
      },
      modalVisible: false
    };
  }

  componentDidMount() {
    checkConnectionStatus()
        .then(response => {
          this.props.fetchCollections(
              browserStorage.getItem("defaultCollectionId")
          );
          this.setState({
            isApplicationLoading: false
          });
        })
        .catch(error => {
          console.error(error);
          if (error.response) {
            Modal.error({
              title: i18n.CONNECTION_ERROR,
              content: `CODE: ${error.response.data.code} / Message: ${
                  error.response.data.message
                  }`
            });
          } else {
            Modal.error({
              title: i18n.ERROR,
              content: error.message
            });
          }
        });
  }

  render() {
    const {
      isApplicationLoading,
      query,
      nextQueryMode,
      queryMode,
      classificationData,
      isClassificationDataLoading,
      documents,
      isDocumentsLoading,
      facetFields,
      isFacetFieldsLoading,
      queryHistory,
      selectedDocument,
      modalVisible
    } = this.state;
    const {
      isFetchingCollections,
      currentCollection,
      collections
    } = this.props;

    return (
        <Layout className="App">
        <Header className="App-header">
        <div className="App-header-container">
        <img className="App-logo" src={logo} alt="logo" height="40" />
        <div className="App-name-container">
        <div className="App-name-title">
        IBM Cognitive Analytics Service
    </div>
    <div className="App-name-subtitle">
        powered by Watson Explorer oneWEX ver.12.0.2
    </div>
    </div>
    <CollectionSelect
    collections={collections}
    currentCollectionId={currentCollection.id}
    onChangeCollection={this.handleCollectionChange}
    onClickRefresh={this.handleCollectionRefreshClick}
    isLoadingCollection={isFetchingCollections}
    />
    </div>

    <QueryBar
    inputValue={query}
    onChangeInput={this.handleQueryInputChange}
    onClear={this.handleClearQuery}
    onSearch={this.handleSearch}
    queryMode={nextQueryMode}
    onChangeQueryMode={this.handleQueryModeChange}
    placeholder={i18n.QUERY_BAR_PLACEHOLDER}
    disabled={isApplicationLoading}
    />
    </Header>
    <Layout className="App-body">
        <Spin
    size="large"
    tip={i18n.LOADING}
    style={{ maxHeight: "100%" }}
    spinning={isApplicationLoading}
        >
        <Content className="App-body-content">
        <div
    className="App-body-content-column"
    style={{ gridTemplateRows: "3fr 1fr" }}
  >
  <FacetCard
    title={i18n.Facet_CARD_TITLE}
    isLoading={isFacetFieldsLoading}
    data={facetFields}
    />
    <QueryHistoryCard
    title={i18n.QUERY_HISTORY_CARD_TITLE}
    isLoading={false}
    data={queryHistory}
    onClickQuery={this.handleClickQuery}
    />
    </div>
    <div
    className="App-body-content-column"
    style={{ gridTemplateRows: "1fr" }}
  >
  <ResultCard
    title={i18n.RESULT_CARD_TITLE}
    isLoading={isDocumentsLoading}
    data={documents}
    onClickDocument={this.handleDocumentClick}
    renderRow={this.renderRow(queryMode)}
    />
    </div>
    </Content>
    </Spin>
    </Layout>
    <DocumentDetailModal
    doc={selectedDocument}
    visible={modalVisible}
    onOk={this.handleModalClickOk}
    onCancel={this.handleModalClickCancel}
    />
    </Layout>
  );
  }
  /* end of lifecycle methods */

  /* ui handler methods */
  handleCollectionChange = collectionId => {
    this.props.setCurrentCollection(collectionId);
    browserStorage.setItem("defaultCollectionId", collectionId);
  };

  handleCollectionRefreshClick = () => {
    this.props.fetchCollections();
  };

  handleQueryModeChange = value => {
    this.setState({
      nextQueryMode: value
    });
  };

  handleQueryInputChange = event => {
    const query = event.target.value;
    this.setState({
      query
    });
  };

  handleClearQuery = () => {
    this.setState({
      query: ""
    });
  };

  handleSearch = () => {
    if (this.state.query.length > 0) {
      this.handleSendQuery(this.state.query);
    }
  };

  handleSendQuery = query => {
    this.fetchAnalysisData(query);
  };

  handleModalClickOk = () => {
    this.setState({
      modalVisible: false
    });
  };

  handleModalClickCancel = () => {
    this.setState({
      modalVisible: false
    });
  };

  handleDocumentClick = document => {
    this.setState({
      modalVisible: true,
      selectedDocument: {
        //date: moment(document.date).format("l") && moment(0).format("l"),
        ...document
      }
    });
  };

  handleClickQuery = (index, query, queryMode, event) => {
    this.setState(
        {
          nextQueryMode: queryMode,
          query
        },
        () => {
          this.fetchAnalysisData(query);
        }
    );
  };
  /* end of ui handler methods */

  /* other methods */
  fetchAnalysisData = query => {
    this.setState({
      isClassificationDataLoading: true,
      isDocumentsLoading: true,
      isFacetFieldsLoading: true
    });

    let fetchFunc;
    let collectionId = this.props.currentCollection.id;

    switch (this.state.nextQueryMode) {
      case QUERY_MODE_BASIC_SEARCH:
        fetchFunc = Promise.all([
          fetchClassifierResult(collectionId, query),
          fetchBasicQueryResult(collectionId, query, 30) //유사문서검색과 service.js내의 내용이 동일하다. server app.js에서 다르게 처리된다.
        ]);
        break;
      case QUERY_MODE_PHRASAL_SEARCH:
        fetchFunc = Promise.all([
          fetchClassifierResult(collectionId, query),
          fetchPhrasalQueryResult(collectionId, query, 30)
        ]);
        break;
      default:
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:
        fetchFunc = Promise.all([
          fetchClassifierResult(collectionId, query),
          fetchSimilarDocumentQueryResult(collectionId, query, 30)
        ]);
        break;
    }

    return fetchFunc
        .then(results => {
          // alert("#1 results[1] : " + JSON.stringify(results[1]));
          // alert("#2 results[1].docs : " + JSON.stringify(results[1].docs));
          // alert("#3 results[1].facetFields : " + JSON.stringify(results[1].facetFields));
          // alert("#4 results[1].facetFields : " + JSON.stringify(results[1].author));
          console.log("#4 results[1].facetFields : " + JSON.stringify(results[1].author));

          this.setState((prevState, props) => {
            const index = prevState.queryHistory.length;
            return {
              queryMode: prevState.nextQueryMode,
              isClassificationDataLoading: false,
              isDocumentsLoading: false,
              isFacetFieldsLoading: false,
              classificationData: results[0].classes,
              documents: results[1].docs,
              facetFields: results[1].facetFields,
              queryHistory: [
                {
                  index,
                  query,
                  date: moment().valueOf(),
                  queryMode: prevState.nextQueryMode,
                  collection: props.currentCollection
                }
              ].concat(prevState.queryHistory)
            };
          });
        })
        .catch(error => {
          console.error(error);
          Modal.error({ title: i18n.ERROR, content: error.message });
          this.setState({
            isClassificationDataLoading: false,
            isDocumentsLoading: false,
            isFacetFieldsLoading: false
          });
        });
  };

  renderRow(queryMode) {
    switch (queryMode) {
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:
        return onClickItem => item => { //함수자체를 rederRow return으로 ResultCard에 전달한다. <ResultCard renderRow로 전달된 함수는 그대로 <WordCloudrow renderItem에 함수로 전달된다(antd 원형이라 형태를 맞춰준것뿐)
          //아래의 rank, title, ___annotations는 그럼 어디서올까? <WordCloudRow에 전달되는 data={documnets}가 되겠다.
          //documentes는 fetchFunc에서 반환되는 docs의 값이 들어간다.
          const index = item.rank;
          const title = item.title;
          const body = item.body;
          const highlighting = item.___highlighting || "";
          const annotations = item.___annotations;
          return (
              <WordCloudRow
          index={index}
          title={title}
          body={body}
          highlighting={highlighting}
          onClick={onClickItem.bind(this, item)}
          data={annotations.slice(0, 20)}
          />
        );
        };
      case QUERY_MODE_BASIC_SEARCH:
      case QUERY_MODE_PHRASAL_SEARCH:
      default:
        return onClickItem => item => {
          const index = item.rank;
          const title = item.title;
          const body = item.body;
          const highlighting = item.___highlighting || "";
          //
          const annotations = item.___annotations;
          return (
      //        <BasicRow
      <WordCloudRow
          index={index}
          title={title}
          body={body}
          highlighting={highlighting}
          onClick={onClickItem.bind(this, item)}
          //
          data={annotations.slice(0, 20)}
          />
        );
        };
    }
  }
  /* end of other methods */
}

const mapStateToProps = state => ({
  isFetchingCollections: state.collections.isFetching,
  currentCollection: state.collections.currentItem,
  collections: state.collections.items
});

const mapDispatchToProps = dispatch => ({
  fetchCollections: defaultCollectionId =>
      dispatch(fetchCollections(defaultCollectionId)),
  setCurrentCollection: collectionId =>
      dispatch(setCurrentCollection(collectionId))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
