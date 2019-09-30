// module imports
import React, { Component } from "react";
import { connect } from "react-redux";
import { setCurrentCollection, fetchCollections, changeDocCountWithCurrentCollection } from "./action";
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
import FacetCard from "./component/FacetCard";
import CollectionSelect from "./component/CollectionSelect";
import DocumentDetailModal from "./component/DocumentDetailModal";
import WordCloudRow from "./component/ResultCard/WordCloudRow";
import {
  fetchPreviewResult,
  fetchSimilarDocumentQueryResult,
  checkConnectionStatus,
  fetchWordCloudResult
} from "./lib/service";
import { browserStorage } from "./lib/util";
import { i18n } from "./lib/constant";
// import logo from "./logo.svg";
import logo from "./logo2.png";

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
      modalVisible: false,
      docsCount: 0,
      docIds: []
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
      documents,
      isDocumentsLoading,
      facetFields,
      isFacetFieldsLoading,
      selectedDocument,
      modalVisible,
      docsCount,
      docIds
    } = this.state;
    const {
      isFetchingCollections,
      currentCollection,
      collections,
      currentCollectionDocCount
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
            title={i18n.Facet_CARD_TITLE + '(전체 1,009건)'}
            isLoading={isFacetFieldsLoading}
            data={facetFields}
            queryData={this.state.query}
            onClickQuery={this.handleClickQuery}
            currentCollectionDocCount={currentCollectionDocCount}
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
        docsCount={docsCount}
        onClickDocument={this.handleDocumentClick}
        renderRow={this.renderRow(queryMode)}
        test={this.test}
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
test = () => () => {
  this.setState(
    () => {
      alert("test");
      // this.fetchAnalysisData(query, newFacet);
    }
);
}
 goToHome = () => {
    window.location.href = 'http://klab-onewex-host.fyre.ibm.com:8001';
  }
  handleCollectionChange = collectionId => {
    this.props.setCurrentCollection(collectionId);
    this.props.changeDocCountWithCurrentCollection(collectionId);
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
      this.handleSendQuery(this.state.query, this.state.docIds);
    }
  };

  handleSendQuery = (query, docIds) => {
    this.setState({
      documents: [],
      facetFields: []
    });
    this.fetchAnalysisData(query, null, docIds);
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
    // alert(Object.keys(document)); 
    // alert(JSON.stringify(document.___highlighting));
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
          query: query,
          documents: [],
          facetFields: []
        },
        () => {
          this.fetchAnalysisData(query, newFacet);
        }
    );
  };
  /* end of ui handler methods */



  /* other methods */
  fetchPreview = (query, newFacet) => {
      this.setState({
          isDocumentsLoading: true,
          isFacetFieldsLoading: true
      });
      let fetchPreview;
      let collectionId = this.props.currentCollection.id;
      switch (this.state.nextQueryMode) {
          default:
          case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:

              fetchPreview = Promise.all([
                  fetchPreviewResult(collectionId, query, newFacet)
              ]);
              break;
      }
      return fetchPreview
          .then( results => {
              this.setState((prevState, props) => {
                return {
                    docsCount: results[0].docsCount,
                    facetFields: results[0].facetFields
                }
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

  }

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
          // console.log("#1 results[1] : " + JSON.stringify(results[0]));
          // alert("#2 results[1].docs : " + JSON.stringify(results[1].docs));
          // alert("#3 results[1].facetFields : " + JSON.stringify(results[1].facetFields));
          // alert("#4 results[1].facetFields : " + JSON.stringify(results[1].author));
          //console.log("#4 results[1].facetFields : " + JSON.stringify(results[1].author));
         
          //문서들의 id값을 수집한다(api 비동기 콜을 위해서)
          // console.log("#" + results[0].docs[0].id);
          let docIdsArray=[];
          for(let i=0; i<results[0].docs.length; i++){
            docIdsArray.push(results[0].docs[i].id);
          }
          // console.log("doc : " + docIdsArray[0]);
          // console.log("##" + docIdsArray.length); //10개

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
              docIds: docIdsArray
            };
          });
          for(let i=0; i<10; i++){
            this.fetchWordCloud(docIdsArray[i], null, 1, 0);
          }
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


  //wordcloud data
  fetchWordCloud  = (query, newFacet, docCount, startPoint) => {
    this.setState({
      isClassificationDataLoading: true,
      isDocumentsLoading: true,
      isFacetFieldsLoading: true
    });

    let fetchWordCloud;
    let collectionId = this.props.currentCollection.id;

    switch (this.state.nextQueryMode) {
      default:
      case QUERY_MODE_SIMILAR_DOCUMENT_SEARCH:

        fetchWordCloud = Promise.all([
          fetchWordCloudResult(collectionId, query, docCount, startPoint, newFacet)
        ]);
        break;
    }

    return fetchWordCloud
        .then(results => {
           this.setState((prevState, props) => {
          //preview JSON객체와 wordCloud JSON객체를 합친다
            // console.dir("result3: " + JSON.stringify(prevState.documents));
            // console.dir("#1 : " + JSON.stringify(prevState.documents[0]));
            // console.dir("#3 : " + JSON.stringify(results[0].docs[0]));

            let tempArr = prevState.documents;  //JSON
            // console.log("#2 : " + JSON.stringify(tempArr));

            for(let i=0; i<tempArr.length; i++){
              if(Object.keys(results[0].docs).length > 0){  //docs[i].id 가 없는 애들이 있음
                if(this.state.docIds[i] === results[0].docs[0].id){
                  Object.assign(tempArr[i], results[0].docs[0])
                }
              }              
            }     
   
            // console.dir("#1 :" + JSON.stringify(tempArr))
            return {
              queryMode: prevState.nextQueryMode,
              isClassificationDataLoading: false,
              isDocumentsLoading: false,
              isFacetFieldsLoading: false,
              documents: tempArr  //Array
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

//실제 API 호출
  fetchAnalysisData = (query, newFacet, docIds) => {
      this.fetchPreview(query, newFacet);
      this.fetchCore(query, newFacet, 10, 0);
      // this.fetchWordCloud(docIds[0], newFacet, 1, 0);
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
          if(item.___annotations){
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
//reducer에서 넘어오는 state 객체를 this.props.isFetch~ 라고 접근할 수 있게한다.
const mapStateToProps = state => ({
  isFetchingCollections: state.collections.isFetching,
  currentCollection: state.collections.currentItem,
  collections: state.collections.items,
  currentCollectionDocCount: state.collections.currentCollectionDocCount  //from reducer/index.js
});
//this.props.fetch에 dispatch를 맵핑시켜 사용할 수 있다.
const mapDispatchToProps = dispatch => ({
  fetchCollections: defaultCollectionId =>
      dispatch(fetchCollections(defaultCollectionId)),
  setCurrentCollection: collectionId =>
      dispatch(setCurrentCollection(collectionId)),
  changeDocCountWithCurrentCollection: collectionId =>
    dispatch(changeDocCountWithCurrentCollection(collectionId))    
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
