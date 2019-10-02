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
import logo from "./logo.svg";
// import logo from "./logo2.png";

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
      docIds: [],
      startDocument: 0,
      currentPage: 1,
        indexForResult: 1,
        chartRate: '0vmax'
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
      currentPage
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
            title={i18n.Facet_CARD_TITLE + `(전체 1,009)`}
            isLoading={isFacetFieldsLoading}
            data={facetFields}
            queryData={this.state.query}
            onClickQuery={this.handleClickQuery}
            currentCollectionDocCount={currentCollectionDocCount}
            chartRate={this.state.chartRate}
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
        getNextPage={this.getNextPage}
        pageNow={currentPage}
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

  getBarChartSize = (chartRate, jsonArray) =>{
      for(let i=0; i<jsonArray.length; i++){ //15times
          console.log("count.. : " + jsonArray[i].count);
          if(0 < jsonArray[i].count && jsonArray[i].count <= chartRate){
              jsonArray[i].count = '1vmax';
          }else if(chartRate < jsonArray[i].count && jsonArray[i].count <= chartRate * 2){
              jsonArray[i].count = '2vmax';
          }else if(chartRate * 2 < jsonArray[i].count && jsonArray[i].count <= chartRate * 3){
              jsonArray[i].count = '3vmax';
          }else if(chartRate * 3 < jsonArray[i].count && jsonArray[i].count <= chartRate * 4){
              jsonArray[i].count = '4vmax';
          }else if(chartRate * 4 < jsonArray[i].count && jsonArray[i].count <= chartRate * 5){
              jsonArray[i].count = '5vmax';
          }else if(chartRate * 5 < jsonArray[i].count && jsonArray[i].count <= chartRate * 6){
              jsonArray[i].count = '6vmax';
          }else if(chartRate * 6 < jsonArray[i].count){
              jsonArray[i].count = '7vmax';
          }
          console.log("result: " + jsonArray[i].count);
      }

      this.setState({
          facetFields: jsonArray
      })
  }
  getNextPage = (page) => {
    //page is 1, 2, 3 ...
    //초기호출시 10개 (docIndex is 0~9)
    this.setState({
      startDocument: ((page -1) * 10),
      currentPage: page
      },
        () => {
         this.fetchAnalysisDataMore(this.state.query, this.state.newFacet, this.state.startDocument);
        }
    );
  };
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

  handleSendQuery = (query) => {
    this.setState({
      documents: [],
      facetFields: []
    });
    this.fetchAnalysisData(query, null, this.state.startDocument);
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
          this.fetchAnalysisData(query, newFacet, this.state.startDocument);
        }
    );
  };
  /* end of ui handler methods */



  /* other methods */
  //문서 수
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

  //문서 프리뷰
  fetchCore  = (query, newFacet, docCount, startPoint) => {
    this.setState({
      isClassificationDataLoading: true,
      isDocumentsLoading: true,
      isFacetFieldsLoading: true
    });

    let fetchFunc;
    let collectionId = this.props.currentCollection.id;

    switch (this.state.nextQueryMode) {
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
          //문서들의 id값을 수집한다(api 비동기 콜을 위해서)
          // console.log("#" + results[0].docs[0].id);
          let docIdsArray=[];
          for(let i=0; i<results[0].docs.length; i++){
            docIdsArray.push(results[0].docs[i].id);
          }
          // console.log("doc : " + docIdsArray[0]);
          // console.log("##" + docIdsArray.length); //10개

            //그래프 계산하기
            let arr = [results[0].facetFields[0].count,
                              results[0].facetFields[5].count,
                              results[0].facetFields[10].count]; //index is 0~14
            console.log("countArray : " + arr.toString());
            //sort
            for(let i=0; i<2; i++){
                for(let j=0; j<2; j++){
                    if(arr[j] < arr[j+1]){
                        console.log("yes");
                        let temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            console.log("sortedArray : " + arr.toString());
            const chartRate = arr[0]/7.0;   //vmax 7이 넘어가면 그래프가 아래로 내려가는 현상 발생.
            console.log("rate : " + chartRate);
            this.getBarChartSize(chartRate, results[0].facetFields); //float, jsonArray

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
              // documents: prevState.documents.concat(results[0].docs), //연속 붙이기의 비밀
              documents: results[0].docs, //연속 붙이기의 비밀
              facetFields: results[0].facetFields,
              docIds: docIdsArray,
              chartRate: chartRate
            };
          });
          for(let i=0; i<10; i++){
            this.fetchWordCloud(decodeURI(docIdsArray[i]), null, 1);  //docIdsArray : 인공지능의_미래.pdf (한국어는 깨져서 encoding된 string을 Decode 해준다.)
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
  //여기서는 startpoin가 0이어야한다. 왜냐면 문서id로 검색해서 해당 문서의 어노테이션을 가져오니까
  fetchWordCloud  = (query, newFacet, docCount) => {
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
          fetchWordCloudResult(collectionId, query, docCount, newFacet)
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
            
            let tempArr = this.state.documents;  //10개의 프리뷰 문서를 불러온다.
            // console.log("#prevState.documents : " + JSON.stringify(tempArr));

            //비동기로 호출한 wordcloud를 기존에 불러온 preview 내용에 각 문서의 id값을 기준으로 highlight_body와 annotation들을 매핑해준다.
            for(let i=0; i<tempArr.length; i++){
              if(Object.keys(results[0].docs).length > 0){  //docs[i].id 가 없는 애들이 있음
                if(this.state.docIds[i] === results[0].docs[0].id){
                  Object.assign(tempArr[i], results[0].docs[0])
                }
              }              
            }     
                     
            // let finalDocument;
            // if(startPoint > 0){
            //   finalDocument = Object.assign(slicedArr, tempArr);
            // } 
            // console.dir("#1 :" + JSON.stringify(tempArr))
            return {
              queryMode: prevState.nextQueryMode,
              isClassificationDataLoading: false,
              isDocumentsLoading: false,
              isFacetFieldsLoading: false,
              documents: tempArr  //Array
              // documents: finalDocument  //prevState.documents의 한개의 객체에만 annotation을 싣어서 documnets객체 자체를 return한다.
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
  fetchAnalysisData = (query, newFacet, startDocument) => {
      this.fetchPreview(query, newFacet);
      this.fetchCore(query, newFacet, 10, startDocument);
        };
  fetchAnalysisDataMore = (query, newFacet, startDocument) => {
    this.fetchCore(query, newFacet, 10, startDocument);
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
                publisher = {publisher} s
                yearOfPublication = {yearOfPublication}
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
