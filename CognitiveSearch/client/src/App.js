// module imports
import React, { Component } from "react";
import { connect } from "react-redux";
import { 
  setCurrentCollection, 
  fetchCollections, 
  // changeDocCountWithCurrentCollection 
} from "./action";
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
  fetchWordCloudResult,
  cancel
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
      currentFacetQuery: "",
      queryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      nextQueryMode: QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
      classificationData: [],
      isClassificationDataLoading: false,
      documents: [],
      isDocumentsLoading: false,
      facetFields: [
        // {"value":"나랏", "count":'100%'}, {"value":"피자", "count":'70%'},
        // {"value":"말쌈", "count":'50%'},{"value":"치킨", "count":'30%'},
        // {"value":"사과", "count":'0'}
      ],
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
      chartRate: '0%',
      FacetCheckHistory: [] //[{key:'', check:''}]
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
              {/* {console.log(JSON.stringify(this.state.FacetCheckHistory))} */}
            </div>
            <div className="App-name-subtitle">
                Watson Explorer oneWEX ver.12.0.3

            </div>
          </div>
         </div>

        <div className="App-query-container"> 
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
        <div className="App-collection-container"> 
          <CollectionSelect
              collections={collections}
              currentCollectionId={currentCollection.id}
              onChangeCollection={this.handleCollectionChange}
              onClickRefresh={this.handleCollectionRefreshClick}
              isLoadingCollection={isFetchingCollections}
          />
        </div>
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
            onFacetQuery={this.handleFacetQuery}
            currentCollectionDocCount={currentCollectionDocCount}
            chartRate={this.state.chartRate}
            FacetCheckHistory={this.state.FacetCheckHistory}
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
        // console.log("count.. : " + jsonArray[i].count);
        if(0 < jsonArray[i].count && jsonArray[i].count <= chartRate){
          Object.assign(jsonArray[i], {'size': '14%'});
        }else if(chartRate < jsonArray[i].count && jsonArray[i].count <= chartRate * 2){
          Object.assign(jsonArray[i], {'size': '28%'});
        }else if(chartRate * 2 < jsonArray[i].count && jsonArray[i].count <= chartRate * 3){
          Object.assign(jsonArray[i], {'size': '42%'});
        }else if(chartRate * 3 < jsonArray[i].count && jsonArray[i].count <= chartRate * 4){
          Object.assign(jsonArray[i], {'size': '56%'});
        }else if(chartRate * 4 < jsonArray[i].count && jsonArray[i].count <= chartRate * 5){
          Object.assign(jsonArray[i], {'size': '70%'});
        }else if(chartRate * 5 < jsonArray[i].count && jsonArray[i].count <= chartRate * 6){
          Object.assign(jsonArray[i], {'size': '84%'});
        }else if(chartRate * 6 < jsonArray[i].count){
          Object.assign(jsonArray[i], {'size': '100%'});
        }
    }

    this.setState({
        facetFields: jsonArray
    })
}
getNextPage = (page) => {
  for (const key in cancel) {
    let cancelAxios = cancel[key];
    cancelAxios();
  }
  //page is 1, 2, 3 ...
  //초기호출시 10개 (docIndex is 0~9)
  this.setState({
    startDocument: ((page -1) * 10),
    currentPage: page
    },
      () => {
        // console.log("흠 : " + this.state.query + ", " + this.state.newFacet + ", "+ this.state.startDocument)
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
  for (const key in cancel) {
    let cancelAxios = cancel[key];
    cancelAxios();
  }  
  if (this.state.query.length > 0) {
    this.handleSendQuery(this.state.query, this.state.docIds);
  }
};

handleSendQuery = (query) => {
  this.setState({
    documents: [],
    facetFields: [],
    FacetCheckHistory: [],
    startDocument: 0,
    currentPage: 1    
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

//패싯 선택 유무 갱신 및 새 쿼리 요청 (여기서는 FacetCheckHistory를 변경하며 실제 호출은 FetchCore에서 이뤄짐)
handleFacetQuery = (query, newFacet, checkFacetForKey) => { //기존쿼리, 선택된패싯path:값, 패싯값.
  //Axios Cancellation
  for (const key in cancel) {
    let cancelAxios = cancel[key];
    cancelAxios();
  }
  let tempArr = this.state.FacetCheckHistory;
  let isUnchecked = false;

  //최초 패싯값 클릭시
  if(tempArr.length === 0){
    tempArr.push({'key':checkFacetForKey, 'check':true});
  }else{
    //최초 값이 아닌 경우,
      let isFind = false;
      isUnchecked = false;
      //반복하며, 기존 값과 새 값이 같으면 !check로 변경
      for(let i=0; i<tempArr.length; i++){
        if(tempArr[i].key === checkFacetForKey.trim()){
          isFind = true;
          tempArr[i].check = !tempArr[i].check;
          if(tempArr[i].check === false){
            // console.log("unchecked");
            isUnchecked = true;  
          }
        }
      } //end for
      //반복하며, 기존 값에 새 값이 없으면 push한다.
      if(!isFind){
        tempArr.push({'key':checkFacetForKey, 'check':true});
      }
      
  }
  //패싯 셀렉트 박스를 언체크 하는게 아닌경우에는 그냥 쿼리를 보낸다.
  if(isUnchecked === false){
    this.setState(
      {          isDocumentsLoading: true,
        isFacetFieldsLoading: true,
        FacetCheckHistory: tempArr,
        //ResultCard영역 1페이지로 초기화
        currentPage: 1,
        startDocument: 0
      },
      () => {
          this.fetchAnalysisData(query, newFacet, this.state.startDocument);
      }
    );
  }
  //근데 만약 언체크인게 감지되었을 경우에는
  else if(isUnchecked === true){
    // console.log("@이건 언체크 시도야@");
    //uncheck된 경우 newFacet을 기존 query에서 제거하고, 
    //fetchAnalysisData에 newFacet=null을 보낸다.
    let final;
    let currentQuery = this.state.currentFacetQuery;
    let deleteQuery = newFacet;
    // console.log('#현재쿼리는 : ' + this.state.currentFacetQuery);
    // console.log('#삭제하고싶은 쿼리는 : ' + deleteQuery)
    let strLength = deleteQuery.length;
    let startPoint = currentQuery.indexOf(deleteQuery);
    // console.log('삭제하려는 쿼리의 길이는 : ' + strLength);
    // console.log('삭제하려는 쿼리가 어디에 있는지 : ' + startPoint);

    //문자열 처음에 패싯쿼리가 있을때
    if(startPoint === 0){
      // console.log('처음');
        final = currentQuery.substr(strLength+5, currentQuery.length);    //' AND '
    }
    //마지막
    else if(startPoint + strLength === currentQuery.length){
      // console.log('마지막');
        final = currentQuery.substr(0, startPoint-5);
    }
    //중간
    else{
      // console.log('중간');
        final = currentQuery.substr(0, startPoint-5) + currentQuery.substr(startPoint+strLength, currentQuery.length);
    }
    // console.log('final is : ' + final);
    this.setState(
      {          isDocumentsLoading: true,
        isFacetFieldsLoading: true,
        FacetCheckHistory: tempArr,
        currentFacetQuery: final,
        currentPage: 1,
        startDocument: 0
      },
      () => {
          this.fetchAnalysisData(query, final, this.state.startDocument);
      }
    );
  }

};

handleClickQuery = (index, query, queryMode, newFacet) => {
  this.setState(
      {
        nextQueryMode: queryMode,
        query: query,
        documents: []
      },
      () => {
        this.fetchAnalysisData(query, newFacet, this.state.startDocument);
      }
  );
};

 //부모 함수 : fetchCore가 끝난 시점에 호출된다.
 //컴포넌트에 전달 될 facetFields 객체의 check 속성을, App.js에서 상태를 저장하는 state인 FacetCheckHistory의 check으로 변경해준다.
  updateFacetCheckHistory = () => {
    //키 : 객체배열 FacetCheckHistory를 가져온다 [{ key:'', check:''}]
    //비교 : facetFields를 가져온다 [{value:'', count:'', check:''}]
    //if 키.key가 facetFields.value와 같으면 
      //비교.check에 키.check을 넣어준다.
    // console.log('start')
    let keys = this.state.FacetCheckHistory;  //Array
    //그냥 최초 검색인 경우
    if(keys.length === 0){
      return null;
    }
    let arr = this.state.facetFields; //Array
    for(let i=0; i<keys.length; i++){
      for(let j=0; j<arr.length; j++){
        if(keys[i].key === arr[j].value){
          arr[j].check = keys[i].check;
        }
      }
    }
    // console.log('end');
    this.setState({
      facetFields: arr
    });
  }

  appendFacetQuery = (newFacet) => {
    let prevFacetAndNewFacet;
    if(newFacet !== null && newFacet !== undefined){
      // console.log("새 패싯은 " +newFacet+ "이야")
      let currentFacetQuery = this.state.currentFacetQuery;
      if(currentFacetQuery === ''){
        // console.log("이전에 받은 쿼리는 null이라구")
        prevFacetAndNewFacet = newFacet;
      }else{
        // console.log("이전에 받은 쿼리는 "+currentFacetQuery+"이야")
        if(currentFacetQuery.indexOf(newFacet) !== -1){
          // console.log("이전의 쿼리에 새로운 쿼리가 중복이니 추가하지 않음.");
          prevFacetAndNewFacet = currentFacetQuery;
        }else{
          prevFacetAndNewFacet = currentFacetQuery + " AND " + newFacet;
        }
      }
    }else{
      prevFacetAndNewFacet = newFacet;
    }
    // console.log("최종 newfacet은 : " +  prevFacetAndNewFacet);
    return prevFacetAndNewFacet;
  }
  /* end of ui handler methods */



  /* other methods */
  //문서 수
  fetchPreview = (query, newFacet) => {
    let prevFacetAndNewFacet = this.appendFacetQuery(newFacet);
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
                  fetchPreviewResult(collectionId, query, prevFacetAndNewFacet)
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
    let prevFacetAndNewFacet = this.appendFacetQuery(newFacet);

    this.setState({
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
          fetchSimilarDocumentQueryResult(collectionId, query, docCount, startPoint, prevFacetAndNewFacet)
        ]);
        break;
    }

    return fetchFunc
        .then(results => {
          //패싯 선택시 쿼리를 계속 붙여나간다
          // console.log('results[0].resultFacet : ' + results[0].prevFacet);
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
            // console.log("countArray : " + arr.toString());
            //sort
            for(let i=0; i<2; i++){
                for(let j=0; j<2; j++){
                    if(arr[j] < arr[j+1]){                     
                        let temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
            }
            // console.log("sortedArray : " + arr.toString());
            const chartRate = arr[0]/7.0;   //vmax 7이 넘어가면 그래프가 아래로 내려가는 현상 발생.
            // console.log("rate : " + chartRate);
            this.getBarChartSize(chartRate, results[0].facetFields); //float, jsonArray

          this.setState((prevState, props) => {
            const index = prevState.queryHistory.length;
            return {
              queryMode: prevState.nextQueryMode,
              // classificationData: results[0].classes, //fetchClassifierResult method 제거함으로써 1->0으로 response index 옮김.
              // documents: results[1].docs,
              // facetFields: results[1].facetFields,
              // documents: prevState.documents.concat(results[0].docs), //연속 붙이기의 비밀
              documents: results[0].docs,
              facetFields: results[0].facetFields,
              docIds: docIdsArray,
              chartRate: chartRate,
              currentFacetQuery: results[0].prevFacet
            };
          });
          //패싯 선택 유무 갱신
          this.updateFacetCheckHistory();
          //비동기 워드클라우드 요청
          for(let i=0; i<10; i++){
            this.fetchWordCloud(i, decodeURI(docIdsArray[i]), null, 1);  //docIdsArray : 인공지능의_미래.pdf (한국어는 깨져서 encoding된 string을 Decode 해준다.)
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
  fetchWordCloud  = (index, query, newFacet, docCount) => {
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
          fetchWordCloudResult(index, collectionId, query, docCount, newFacet)
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
      dispatch(setCurrentCollection(collectionId))
  //     ,
  // changeDocCountWithCurrentCollection: collectionId =>
  //   dispatch(changeDocCountWithCurrentCollection(collectionId))    
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
