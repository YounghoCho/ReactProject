// module imports
import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentCollection, fetchCollections } from "./action";
import { Layout, Modal, Spin } from "antd";
import moment from "moment";
import QueryBar from "./component/QueryBar";
import {
  // QUERY_MODE_BASIC_SEARCH,
  QUERY_MODE_SIMILAR_DOCUMENT_SEARCH
  // ,
  // QUERY_MODE_PHRASAL_SEARCH
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
          <div className="App-name-container" onClick={this.goToHome}>
            <div className="App-name-title">
              IBM Cognitive Search
            </div>
            <div className="App-name-subtitle">
                Watson Explorer oneWEX ver.12.0.3
            </div>
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
        </div>
          <CollectionSelect
              collections={collections}
              currentCollectionId={currentCollection.id}
              onChangeCollection={this.handleCollectionChange}
              onClickRefresh={this.handleCollectionRefreshClick}
              isLoadingCollection={isFetchingCollections}
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
          style={{ gridTemplateRows: "1fr" }}
        >
          <FacetCard
            title={i18n.Facet_CARD_TITLE}
            isLoading={isFacetFieldsLoading}
            data={facetFields}
            queryData={this.state.query}
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
  goToHome = () => {
    window.location.href = 'http://klab-onewex-host.fyre.ibm.com:8000';
  }
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
    this.setState({
      documents: [],
      facetFields: []
    });
    
    this.fetchAnalysisData(query, null);
    this.fetchAnalysisData2(query, null);
    this.fetchAnalysisData3(query, null);
    this.fetchAnalysisData4(query, null);
    this.fetchAnalysisData5(query, null);
    this.fetchAnalysisData6(query, null);
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

  handleClickQuery = (index, query, queryMode, newFacet) => {
    this.setState(
        {
          nextQueryMode: queryMode,
          query,
          documents: [],
          facetFields: []
        },
        () => {
          this.fetchAnalysisData(query, newFacet);
          this.fetchAnalysisData2(query, newFacet);
          this.fetchAnalysisData3(query, newFacet);
          this.fetchAnalysisData4(query, newFacet);
          this.fetchAnalysisData5(query, newFacet);
          this.fetchAnalysisData6(query, newFacet);
        }
    );
  };
  /* end of ui handler methods */



  /* other methods */
  //yhj
  fetchCore  = (query, newFacet, docCount, startPoint) => {
    this.setState({
      isClassificationDataLoading: true,
      isDocumentsLoading: true,
      isFacetFieldsLoading: true
    });

    let fetchFunc;
    let collectionId = this.props.currentCollection.id;

    switch (this.state.nextQueryMode) {
        // case QUERY_MODE_BASIC_SEARCH:
        //   fetchFunc = Promise.all([
        //      fetchClassifierResult(collectionId, query),
        //     fetchBasicQueryResult(collectionId, query, 30) //유사문서검색과 service.js내의 내용이 동일하다. server app.js에서 다르게 처리된다.
        //   ]);
        //   break;
        // case QUERY_MODE_PHRASAL_SEARCH:
        //   fetchFunc = Promise.all([
        //      fetchClassifierResult(collectionId, query),
        //     fetchPhrasalQueryResult(collectionId, query, 30)
        //   ]);
        //   break;
      default:
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:
        fetchFunc = Promise.all([
          // fetchClassifierResult(collectionId, query),
          fetchSimilarDocumentQueryResult(collectionId, query, docCount, startPoint, newFacet)
        ]);
        break;
    }

    return fetchFunc
        .then(results => {
          // alert("#1 results[1] : " + JSON.stringify(results[1]));
          // alert("#2 results[1].docs : " + JSON.stringify(results[1].docs));
          // alert("#3 results[1].facetFields : " + JSON.stringify(results[1].facetFields));
          // alert("#4 results[1].facetFields : " + JSON.stringify(results[1].author));
          //console.log("#4 results[1].facetFields : " + JSON.stringify(results[1].author));

          this.setState((prevState, props) => {
            const index = prevState.queryHistory.length;
            return {
              queryMode: prevState.nextQueryMode,
              isClassificationDataLoading: false,
              isDocumentsLoading: false,
              isFacetFieldsLoading: false,
              // classificationData: results[0].classes, //fetchClassifierResult method 제거함으로써 1->0으로 response index 옮김.
              // documents: results[1].docs,
              // facetFields: results[1].facetFields,
              documents: prevState.documents.concat(results[0].docs), //연속 붙이기의 비밀
              facetFields: results[0].facetFields,
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

//비동기 호출부
  fetchAnalysisData = (query, newFacet) => {
    this.fetchCore(query, newFacet, 1, 0);
  };
  fetchAnalysisData2 = (query, newFacet) => {
    this.fetchCore(query, newFacet, 2, 1);
  };
  fetchAnalysisData3 = (query, newFacet) => {
    this.fetchCore(query, newFacet, 2, 3);
  };
  fetchAnalysisData4 = (query, newFacet) => {
    this.fetchCore(query, newFacet, 2, 5);
  };
  fetchAnalysisData5 = (query, newFacet) => {
    this.fetchCore(query, newFacet, 10, 7);
  };
  fetchAnalysisData6 = (query, newFacet) => {
    this.fetchCore(query, newFacet, 10, 17);
  };

  renderRow(queryMode) {
    switch (queryMode) {
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:
        return onClickItem => item => {
          //함수자체를 rederRow return으로 ResultCard에 전달한다.
          // <ResultCard renderRow로 전달된 함수는 그대로 <WordCloudrow renderItem에 함수로 전달된다(antd 원형이라 형태를 맞춰준것뿐)
          //아래의 rank, title, ___annotations는 그럼 어디서올까? <WordCloudRow에 전달되는 data={documents}가 되겠다.
          //documentes는 fetchFunc에서 반환되는 docs의 값이 들어간다.

         // const index = item.rank;
          const body = item.body;
          const highlighting = item.___highlighting || "";
          //WordCloud용 데이터로, 색상을 각각 주기 위한 작업.
          let annotations1=[], annotations2=[], annotations3=[];
          const annotations = item.___annotations;
          for(let i=0; i<annotations.length; i++){
            switch(annotations[i].colorGroup){
              case "ai":
                annotations1 = annotations1.concat(annotations[i]);
                break;
              case "industry":
                annotations2 = annotations2.concat(annotations[i]);
                break;
              case "application":
                annotations3 = annotations3.concat(annotations[i]);
                break;
              default:
                annotations1 = annotations1.concat(annotations[i]);
                break;
            }
          }
          //details
          const keyword = item.keyword;
          const author  = item.author;
          const journalTitle  = item.journalTitle;
          const publisher = item.publisher;
          const yearOfPublication = item.yearOfPublication;
          const title = item.titleOfThesis || item.Title;

          return (
              <WordCloudRow
                title={title}
                body={body}
                highlighting={highlighting}
                onClick={onClickItem.bind(this, item)}
                data={annotations1}
                data2={annotations2}
                data3={annotations3}
                keyword = {keyword}
                author = {author}
                journalTitle = {journalTitle}
                publisher = {publisher}
                yearOfPublication = {yearOfPublication}
              />
        );
        };
      // case QUERY_MODE_BASIC_SEARCH:
      // case QUERY_MODE_PHRASAL_SEARCH:
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
