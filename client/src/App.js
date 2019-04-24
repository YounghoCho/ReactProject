//import module
import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentCollection, fetchCollections } from "./action";
import { Layout, Modal, Spin } from "antd";
import moment from "moment";
//import components
import QueryBar from "./component/QueryBar";
import {
  QUERY_MODE_BASIC_SEARCH,
  QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
  QUERY_MODE_PHRASAL_SEARCH
} from "./component/QueryModeSelect";
import ResultCard from "./component/ResultCard";
import ClassificationCard from "./component/ClassificationCard";
import QueryHistoryCard from "./component/QueryHistoryCard";
import CollectionSelect from "./component/CollectionSelect";
import DocumentDetailModal from "./component/DocumentDetailModal";
import BasicRow from "./component/ResultCard/BasicRow";
import WordCloudRow from "./component/ResultCard/WordCloudRow";
//import libs
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
  constructor(props) { //constructor는 Component를 상속했다는 의미인데, 기존 클래스의 생성자를 덮어쓰는 격이다.
    super(props); //그래서 super(props)로 먼저 리액트가 가지고 있던 컴포넌트를 super로 먼저 실행하고
    this.state = { //그 다음에 우리가 할 작업(state)을 설정해준다.
      //위의 3줄을 state = {} 으로 축약해서 쓸수있다.(class field 문법)
      isApplicationLoading: true,
      query: "",
      queryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      nextQueryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      classificationData: [],
      isClassificationDataLoading: false,
      documents: [],
      isDocumentsLoading: false,
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
  //Render() 후에 실행되는 Lifecycle 메소드다. 주로 ajax,setTime,Interval 등을 추가해준다.
  componentDidMount() {
    checkConnectionStatus() // service.js의 /connection 메소드 실행하고, server에서 /connection 라우터에서 user validate API를 쏜다.
      .then(response => {
        this.props.fetchCollections(
          browserStorage.getItem("defaultCollectionId") //브라우저에서 cid를 가져온다음 /action/index.js의 fetchCollections를 실행시킨다.
        );
        this.setState({
          isApplicationLoading: false //Spin(로딩아이콘)을 끈다.
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
                IBM Cognitive Knowledge Service
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
            inputValue={query} //사용자가 입력한 query를 출력한다.
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
                style={{ gridTemplateRows: "1fr 3fr" }}
              >
                <ClassificationCard
                  title={i18n.CLASSIFICATION_CARD_TITLE}
                  isLoading={isClassificationDataLoading}
                  data={classificationData}
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
  //client/src/App.js의 <CollectionSelect>에서 콜렉션종류를 바꾸면 onchange에 handleCollectionChange가 호출되고,
  handleCollectionChange = collectionId => {
    this.props.setCurrentCollection(collectionId);
    browserStorage.setItem("defaultCollectionId", collectionId);//브라우저에 collectionId를 default라는 key로 저장한다.
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
      isDocumentsLoading: true
    });

    let fetchFunc;
    let collectionId = this.props.currentCollection.id; //질문 currentCollection은 어디서오나?

    switch (this.state.nextQueryMode) {
      case QUERY_MODE_BASIC_SEARCH:
        fetchFunc = Promise.all([
          fetchClassifierResult(collectionId, query),
          fetchBasicQueryResult(collectionId, query, 30)
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
      .then(results => { //lib/service.js에서 오는 response값이다.
        this.setState((prevState, props) => {//setState는 비동기로 state를 업데이트 하는 함수인데, 이전상태를 가지고 무언가를 하고싶다면 prevState를 쓴다.
          const index = prevState.queryHistory.length; //history 관리를 위해서 이전 history를 쓰는것이다.
          return {
            queryMode: prevState.nextQueryMode,
            isClassificationDataLoading: false,
            isDocumentsLoading: false,
            classificationData: results[0].classes,
            documents: results[1].docs,
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
          isDocumentsLoading: false
        });
      });
  };

  renderRow(queryMode) {
    switch (queryMode) {
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:
        //지금 ocClickItem함수로 익명함수(item)을 넘겨주는 과정인데 react에서 많이 쓰는 방식이라고한다.
        return onClickItem => item => { //item은 어디서 오는 파라미터지? renderRow는 ResultCard.js에서 쓰잉는데 가보면 antd에서 data객체에서 각각의 data를 "item"이라는 인자로 넘기는것을 예제에서 알 수 있다. ref : https://ant.design/components/list/
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
              onClick={onClickItem.bind(this, item)} //질문:apply, call, bind
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
          return (
            <BasicRow
              index={index}
              title={title}
              body={body}
              highlighting={highlighting}
              onClick={onClickItem.bind(this, item)}
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
