/** Section1 
 * Proxy server code
 */
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");
const fs = require("fs");
const EventEmitter = require("events");
const axios = require("axios");
const queryString = require("querystring");

const app = express();

app.listen(process.env.PORT, () =>
  console.log(`icks-api-server listening at port ${process.env.PORT}`)
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(compression());
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/**
 * error handling
 * 
 * EventEmitter란, 옵저버 패턴을 쓰는 DOM event listener다.
 */
class BaseEventEmitter extends EventEmitter {}
const baseEventEmitter = new BaseEventEmitter();
//baseEventEmitter.on 으로 리스너를 등록한다.
baseEventEmitter.on("error", message => {
  console.error("=================================================");
  console.error("time : " + new Date().toString());
  console.error("name : Exception");
  console.error("-------------------------------------------------");
  console.error(message);
  console.error("=================================================");
  throw new Error("EmptyConfigurationError");
});

app.use((err, req, res, next) => {
  console.error("=================================================");
  console.error("time : " + new Date().toString());
  console.error("name : Exception");
  console.error("-------------------------------------------------");
  console.error(err.stack);
  console.error("=================================================");
  res.statusCode = 500;
  res.send(err.stack);
});

process.on("uncaughtException", err => {
  console.error("\n\n");
  console.error("=================================================");
  console.error("time : " + new Date().toString());
  console.error("name : UncaughtException");
  console.error("-------------------------------------------------");
  console.error(err.stack);
  console.error("=================================================\n\n");
});

const session = {
  token: ""
};
// ignore self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const config = JSON.parse(fs.readFileSync("./api/config.json", "utf8"));
//baseEventEmitter.emit으로 .on으로 등록한 이벤트를 호출한다.
if (!config) {
  baseEventEmitter.emit(
    "error",
    "You must fill out config.json file located in /server/config.json"
  );
}

if (!config.rootUri) {
  baseEventEmitter.emit(
    "error",
    'You must fill out "rootUri" inside config.json file located in /server/config.json'
  );
}

if (!config.username) {
  baseEventEmitter.emit(
    "error",
    'You must fill out "username" inside config.json file located in /server/config.json'
  );
}

if (!config.password) {
  baseEventEmitter.emit(
    "error",
    'You must fill out "password" inside config.json file located in /server/config.json'
  );
}

const ROOT_URI = config.rootUri;
const STD_API_URI = `${config.rootUri}/api/v1`;
const USERNAME = config.username;
const PASSWORD = config.password;
const authMiddleware = require("./middleware/authMiddleware");
const promiseErrorHandler = res => error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    // console.error(error.response.data);
    // console.error(error.response.status);
    // console.error(error.response.headers);
    res.status(error.response.status).send({ error: error.response });
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    res.status(500).send({ error: error.request });
  } else {
    // Something happened in setting up the request that triggered an Error
    //console.error(error.message);
    res.status(500).send({ error: error.message });
  }
};

// authentication middleware for every REST API call for oneWEX
app.use("/", authMiddleware(STD_API_URI, USERNAME, PASSWORD, session));

app.get("/connection", (req, res) => {
  axios({
    method: "GET",
    url: `${STD_API_URI}/usermgmt/validate`,
    headers: {
      username: USERNAME,
      password: PASSWORD
    }
  })
    .then(response => {
      res.status(200).send({
        wexConnectionStatus: "OK"
      });
    })
    .catch(promiseErrorHandler(res));
});


/** Section2
 * 
 * Methods Modules
 * 
 * 1)fetchFields
 * 2)fetchDocCount
 * 3)fetchDocPreview
 * 4)addHighlighting
 * 5)addHighlightingAndUserDefinedAnnotations
 * 6)makeUserDefinedAnnotationList
 * 7)makeFieldMap @deprecated
 * 8)mapFieldLabel @deprecated
 */
const fetchFields = collectionId =>
  axios({
    method: "GET",
    url: `${STD_API_URI}/collections/${collectionId}`,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });

const fetchDocCount = (collectionId, finalQuery) =>
    axios({
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: queryString.stringify({
            q: finalQuery,
            wt: "json",
            rows: 1
        }),
        url: `${STD_API_URI}/explore/${collectionId}/query`
    });

const fetchDocPreview = (collectionId, finalQuery, start, docCount, facetUriToBeAdded) =>
    axios({
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: queryString.stringify({
            q: finalQuery,
            wt: "json",
            rows: docCount,
            start: start
        }),
        url: `${STD_API_URI}/explore/${collectionId}/query?${facetUriToBeAdded}`
    });

/**
 * parameter for Array.prototype.map()
 * appends highlighting and user-defined annotation data to list of queried documents
 * @param {Object} highlightings
 * @param {Object} highlightings.documentId
 * @param {[]} highlightings.documentId.body
 * @param {Object} highlightings.documentId.views
 * @param {Object} previews
 * @param {Object} previews.documentId
 * @param {Object} previews.documentId.document_facets
 * @param {Object} previews.documentId.analyzed_facets
 * @param {Object} previews.documentId.tokens
 * @returns {Object}
 */
const addHighlighting = (
    highlightings
) => doc => {
    const docId = doc.id;
    // console.log("# : " + Object.keys(highlightings[docId].body).length);
    if(highlightings != null){
      /* below codes were changed cause there was a problem while parsing response data.
      ** const keys = Object.keys(highlightings[docId]); //body, views
      ** console.log('keys : ' + keys)
      ** highlighting = highlightings[docId].body.join("<br>...<br>"); //Arr.join : 배열안의 값을 ()안의 내용으로 구분지어서 하나의 값으로 만든다. ref : https://www.codingfactory.net/10450
      */
    }
    return {
      ...doc,
        id: docId,
         ___highlighting: highlightings[docId].body.toString().replace(/&#32;,/gi, '<br>...<br>')
    };
};

const addHighlightingAndUserDefinedAnnotations = (
    previews
) => doc => {
    const docId = doc.id;
    const analyzedFacets = previews[docId].analyzed_facets;
    return {
        ...doc,
        ___annotations: makeUserDefinedAnnotationList(analyzedFacets)
    };
};

/**Param 'analyzedFacets' is from 'previews[docId].analyzed_facets'
 * makeUserDefinedAnnotationList return 'parsed annotation list'
 * @param {Obejct} val
 * @param {Object} val.responseHeader
 * @param {Object} val.response
 * @param {[]} val.response.docs
 * @param {Object} val.preview
 */
const makeUserDefinedAnnotationList = analyzedFacets => {
  let temp,
    fieldName,
    annoName,
    annoList = [],
    splitterIndex,
    splitterAi,
    indices;

  //Exclude parant tree including its children tree. 
  for (fieldName in analyzedFacets) {
    temp = analyzedFacets[fieldName];
    for (annoName in temp) {
      
      if(annoName.startsWith("annotation.unstructure.tech$")){
        splitterAi = annoName.indexOf("$") + 1;
        //exclude
        if(annoName.slice(splitterAi) === '인공지능' ||
          annoName.slice(splitterAi) === '머신러닝' ||
          annoName.slice(splitterAi) === '딥러닝' ||
          annoName.slice(splitterAi) === '자연어처리'){
        }else{
          //include
          splitterIndex = annoName.indexOf("$") + 1;
          indices = temp[annoName];
          annoList.push({
            annotation: annoName.slice(splitterIndex),
            indices,
            count: indices.length,
            colorGroup: "ai"
          });
        }
      }
      if  (annoName.startsWith("annotation.unstructure.tech.ai")){
        splitterIndex = annoName.indexOf("$") + 1;
        indices = temp[annoName];
        annoList.push({
          annotation: annoName.slice(splitterIndex),
          indices,
          count: indices.length,
          colorGroup: "ai"
        });
      }
      if  (annoName.startsWith("annotation.unstructure.industry")){
          splitterIndex = annoName.indexOf("$") + 1;
          indices = temp[annoName];
          annoList.push({
              annotation: annoName.slice(splitterIndex),
              indices,
              count: indices.length,
              colorGroup: "industry"
          });
      }
      if  (annoName.startsWith("annotation.unstructure.application")){
          splitterIndex = annoName.indexOf("$") + 1;
          indices = temp[annoName];
          annoList.push({
              annotation: annoName.slice(splitterIndex),
              indices,
              count: indices.length,
              colorGroup: "application"
          });
      }
    }
  }
  return annoList
    .filter(val => val.annotation.length >= 1)
    .sort((prev, next) => next.count - prev.count);
};

const makeFieldMap = (tags, fields) => {
  const { defaultBodyFieldId, defaultDateFieldId, defaultTitleFieldId } = tags;
  let fieldMap = {};
  for (let dataSetId in fields) {
    currentDataSet = fields[dataSetId];
    fieldCount = currentDataSet.length;
    for (let i = 0; i < fieldCount; i++) {
      switch (currentDataSet[i].id) {
        case defaultBodyFieldId:
          fieldMap[currentDataSet[i].id] = "body";
          break;
        case defaultDateFieldId:
          fieldMap[currentDataSet[i].id] = "date";
          break;
        case defaultTitleFieldId:
          fieldMap[currentDataSet[i].id] = "title";
          break;
        default:
          fieldMap[currentDataSet[i].id] = currentDataSet[i].label;
          break;
      }
    }
  }
  if (defaultTitleFieldId === "id") {
    fieldMap["id"] = "title";
  }
  return fieldMap;
};

const mapFieldLabel = fieldMap => {
  return (val, index) => {
    const newDoc = {};
    for (let fieldId in val) {
      if (Array.isArray(val[fieldId]) && !fieldId.startsWith("___")) {
        newDoc[fieldMap[fieldId] || fieldId] = val[fieldId].join("\n");
      } else {
        newDoc[fieldMap[fieldId] || fieldId] = val[fieldId];
      }
    }
    newDoc.rank = index + 1;
    return newDoc;
  };
};

/** Section3
 * 
 * API Methods
 * 
 * 1)/basic-query @deprecated
 * 2)/facets @deprecated
 * 3)/phrasal-query @deprecated
 * 4)/classify @deprecated
 * 5)/collections
 * 6)/collections/:collectionId
 * 7)/preview-query
 * 8)/similar-document-query
 * 9)/word-cloud-query
 * 10)/first-query
 * 11)/fetch-first-docs
 * 
 */

app.post("/basic-query", (req, res) => {
  const collectionId = req.body.collectionId;
  const query = req.body.query || "";
  const docCount = req.body.docCount || 20;

  const basicQuery = axios({
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: queryString.stringify({
      q: query,
      wt: "json",
      preview: true //preview 팝업을 켜는 옵션
      // shortCircuit: false,
      // q: `*:* AND (${query})`,
      // rows: docCount,
      // wt: "json"
    }),
    url: `${STD_API_URI}/explore/${collectionId}/query?facet=on&facet.field=author&facet.field=keyword`
  });

  Promise.all([basicQuery, fetchFields(collectionId)])
    .then(responses => {
      const basicQueryResponse = responses[0];
      const fetchFieldsResponse = responses[1];
      // console.log("token : " + session.token);
      //   console.log("#2 : " + JSON.stringify(basicQueryResponse.data));
     //  console.log("#3 : " + JSON.stringify(fetchFieldsResponse.data));

      //response객체는 크게 response, highlights, previews JSON 형태
      const { response, facet_counts, highlighting, previews } = basicQueryResponse.data;
      const docs = response.docs; //배열형태의 데이터¥
      const author =  facet_counts.facet_fields.author; //facet_fileds는 배열이 아니라서 author 까지잡아줌
      const keyword =  facet_counts.facet_fields.keyword;
      // console.log("#1 : " + JSON.stringify(facet_counts.facet_fields.author));
      // console.log("#2 : " + JSON.stringify(facet_counts.facet_fields.keyword));
      let facetsArray = [];
      let facetsCount = 3*2; //패싯은 3줄만 가져올것이며, 가져올 배열은 패싯명:갯수로 되어있어서 *2
      
      for( let i=0; i< facetsCount; i+=2){
          let temp = author[i] + " : " + author[i+1];
          facetsArray.push(temp); 
      }
      for( let i=0; i< facetsCount; i+=2){
        let temp = keyword[i] + " : " + keyword[i+1];
        facetsArray.push(temp); 
    }
      const { tags, fields } = fetchFieldsResponse.data;
      const fieldMap = makeFieldMap(tags, fields);
      // console.log("highlighting : " + highlighting);
      // console.log("previews : " + previews);
      res.status(200).send({
        docs: docs  //array
         .map(addHighlightingAndUserDefinedAnnotations(highlighting, previews)) //similar에서는 addUserDefinedAnnotations에서 ___annotaions들을 반환하고, basic에서는 addHighlightingAndUserDefinedAnnotations에서 ___ano..를 반환한다.
         .map(mapFieldLabel(fieldMap)),
        facetFields: facetsArray
      });
    })
    .catch(promiseErrorHandler(res));
});

app.get("/facets", (req, res) => {
  const collectionId = req.query.collectionId;

  axios({
    method: "POST",
    url: `${ROOT_URI}/miner/main/rapi/solr/${collectionId}/category`,
    headers: {
      Authorization: `Bearer ${session.token}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    data: queryString.stringify({
      shortCircuit: false,
      wt: "json"
    })
  })
    .then(response => {
      res.status(200).send(response.data);
    })
    .catch(err => {
      res.status(err.statusCode).send(err.error);
    });
});

app.post("/phrasal-query", (req, res) => {
  const collectionId = req.body.collectionId;
  const phrase = req.body.query;
  const docCount = req.body.docCount || 20;
  const nlpOptions = {
    method: "POST",
    url: `${STD_API_URI}/collections/${collectionId}/analyze`,
    headers: {
      Authorization: `Bearer ${session.token}`
    },
    data: {
      fields: {
        body: phrase
      },
      metadata: {}
    }
  };

  const filterAnnotations = response => {
    const nlpResult = response.data;
    if (
      nlpResult.enriched &&
      nlpResult.enriched.body &&
      nlpResult.enriched.body[0] &&
      nlpResult.enriched.body[0].annotations
    ) {
      const annotations = nlpResult.enriched.body[0].annotations;
      const annotationCount = annotations.length;
      let filteredAnnotations = [];
      let temp;
      for (let i = 0; i < annotationCount; i++) {
        temp = annotations[i];
        if (
          temp.type &&
          (!temp.type.startsWith("._phrase") &&
            !temp.type.startsWith("._word") &&
            !temp.type.startsWith("._ne") &&
            !temp.type.startsWith("$$$") &&
            !temp.type.startsWith("._sentiment") &&
            !temp.type.startsWith("uima"))
        ) {
          filteredAnnotations.push(
            `annotation${temp.type}:"${temp.properties.facetval}"`
          );
        }
      }
      return filteredAnnotations;
    }
    return [];
  };

  // lack of referential transparency, need to get rid of variables from outer function such as phrase, collectionId, session.token
  const queryWithAnnotations = annotations => {
    let query = phrase; //쿼리문
    const queryOptions = {
      method: "POST",
      url: `${ROOT_URI}/miner/main/rapi/solr/${collectionId}/query`,
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    const form = {
      preview: true,
      shortCircuit: false,
      rows: docCount,
      start: 0,
      wt: "json"
    };
    if (annotations.length > 0) {
      query = `AND (${annotations.reduce((prevAnnotation, curAnnotation) => {
        return `${prevAnnotation} OR ${curAnnotation}`;
      })} OR ${query})`;
    }

    
    form.q = `*:* AND ${query}`;
    queryOptions.data = queryString.stringify(form);
    return axios(queryOptions);
  };

  axios(nlpOptions)
    .then(filterAnnotations)
    .then(queryWithAnnotations)
    .then(queryResponse => {
      const { response, highlighting, previews } = queryResponse.data;
      const docs = response.docs;
      fetchFields(collectionId)
        .then(fetchFieldsResponse => {
          const { tags, fields } = fetchFieldsResponse.data;
          const fieldMap = makeFieldMap(tags, fields);
          res.status(200).send({
            docs: docs
              .map(
                addHighlightingAndUserDefinedAnnotations(highlighting, previews)
              )
              .map(mapFieldLabel(fieldMap))
          });
        })
        .catch(promiseErrorHandler(res));
    })
    .catch(promiseErrorHandler(res));
});

app.post("/classify", (req, res) => {
  const collectionId = req.body.collectionId;
  const query = req.body.query;
  
  axios({
    method: "POST",
    url: `${STD_API_URI}/collections/${collectionId}/analyze`,
    headers: {
      Authorization: `Bearer ${session.token}`
    },
    data: {
      fields: {
        globalFieldName: query
      },
      metadata: {}
    }
  })
    .then(response => {
      res.status(200).send(response.data.metadata); // NLP api의 response를 참조.
    })
    .catch(promiseErrorHandler(res));
});
//client에서 axios 요청을 받고, 여기 라우터에서 실제 onewex로 Http 요청을 전달한다.
app.get("/collections", (req, res) => {
  axios({
    url: `${STD_API_URI}/collections`,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  })
    .then(response => { //axios response객체는 .data형태로 결과를 반환한다.
      const collections = response.data.items; //item : [{ "id" : .., "name" : ...}] 이런 구조로 response가 오고 item하위의 정보를 collections 객체에 담는다.
      res.status(200).send({
        collections: collections //client 단의 collections객체로 방금 응답받은 콜렉션 정보를 맵핑한다.
          ? collections.map(collection => ({ //선언되지 않았으니 호이스팅으로 가장 가까운 변수인 collections(=response.data.items)가 collection변수에 들어간다. map ref : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/map
              id: collection.id, //ket:value형태로 response를 보낸다.(client/src/action/index.js -> 실제로는 build되서 server에 client에 들어있을것임.)
              name: collection.name
            }))
          : []
      });
    })
    .catch(promiseErrorHandler(res));
});

app.get("/collections/:collectionId", (req, res) => {
  const collectionId = req.params.collectionId;
  axios({
    method: "GET",
    url: `${STD_API_URI}/collections/${collectionId}`,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(promiseErrorHandler(res));
});

//문서 수 구하기(result doc count)
app.post("/preview-query", (req, res) => {
  // now(1)
      const collectionId = req.body.collectionId;
      const query = req.body.query || "";
      const newFacet = req.body.newFacet || "";
  
      const nlpData = {
          fields: {
              body: query
          },
          metadata: {}
      };
  
      const nlpRequest = axios({
          method: "POST",
          url: `${ROOT_URI}/api/v1/collections/${collectionId}/analyze`,
          headers: {
              Authorization: `Bearer ${session.token}`,
              "Content-Type": "application/json",
              accept: "application/json"
          },
          data: nlpData
      });
      Promise.all([nlpRequest])
          .then(responses => {
  // now(2)
              const nlpResponse = responses[0]; //miner 화면의 query결과
              const responseData = nlpResponse.data;
              const parseData = responseData.enriched.body[0].annotations;
              const annoLength = parseData.length;
              let annoResult = ''; //나중에 원본 query와 합친다.
              let queryIndex = [];

              //1. 패싯 어노테이션 수집
              let facetvalToCompare = '';
              for(let i=0; i<annoLength; i++){
                  if(parseData[i].type === ".unstructure.tech.ai" ||
                      parseData[i].type === ".unstructure.industry" ||
                      parseData[i].type === ".unstructure.application")
                  {
                      //tech.ai의 4개 value들이 있는 경우 상위 패싯인 tech로 검색되게 한다.
                      if(parseData[i].type.trim() === ".unstructure.tech.ai"){
                          let mlAnnotation = 'annotation.unstructure.tech:"인공지능"';
                          if(annoResult.indexOf(mlAnnotation) == -1){
                              annoResult += mlAnnotation;
                              annoResult += " AND ";
                          }
                          //일반 어노테이션 처리
                      }else{
                          let path = parseData[i].properties.facetpath.trim();
                          let fval = parseData[i].properties.facetval.trim();
                          facetvalToCompare += fval;
  
                          let temp = 'annotation' + path + ':"' + fval + '"';
                          annoResult += temp;
                          annoResult += " AND ";
                      }
                    //query중, 어노테이션에 속한 멍사를 제외하기위해 query의 index를 구한다.
                    queryIndex.push(
                      {
                        'beginIndex':parseData[i].beginIndex,
                        'endIndex': parseData[i].endIndex
                      }
                    );        
                  }
              } //end 1

              //draw a query index's range
              let size = query.length;
              console.log("query : " + query + "\nsize : " + query.length);
              let queryRange = [];
              //init
              for(let i=0; i<size; i++){
                queryRange.push(false);
              }
              //draw queryIndex into queryRange
              for(let i=0; i<queryIndex.length; i++){
                for(j=queryIndex[i].beginIndex; j<=queryIndex[i].endIndex; j++){
                  queryRange[j] = true;
                }
              }
              console.log("결과물 : " + queryRange);

              //for 2.명사 수집
              for(let i=0; i<annoLength; i++){
                  if(parseData[i].type === "._word.noun.general" )
                  {
                      // console.log("1 명사는 : " + parseData[i].properties.facetval.trim());
                      //수집한 명사가 어노테이션과 같지 않을때만 문자열에 추가한다.
                      let fval = parseData[i].properties.facetval.trim();
                      let mlToCompare = '인공지능 딥러닝 머신러닝 자연어처리';
                      console.log("비교문장 : " + facetvalToCompare);
                      // console.log("비교문장은 :" + facetvalToCompare);
                     
                      if(facetvalToCompare.indexOf(fval) == -1 && mlToCompare.indexOf(fval) == -1){
                          //query index에서 범위내에 명사가 있는지 검사한다.
                          //핵심 알고리즘1
                          if(queryRange[parseData[i].beginIndex] === true){
                            continue;
                          }else{
                            //i번째 명사의 시작이 queryRande에서 false로 체크된경우에는 명사도 추가해준다.
                            annoResult += fval;
                            annoResult += " AND ";    
                          }
                      }else{
                          console.log("명사와 쿼리를 비교결과: 있음");
                      }
                  }
              } //end for 2
  
              let finalQuery = '';
              //miner 검색시 검색어 맨앞,뒤에 OR가 붙으면 검색결과 0개.
              if(annoResult.substr(annoResult.length-4, annoResult.length-1).trim() === "AND"){
                  annoResult = annoResult.substr(0, annoResult.length-5);
              }
              if(query === annoResult.trim())
                  finalQuery = query;
              else
                  finalQuery = annoResult.trim();
  
              if(newFacet !== '')
                  finalQuery += " AND ";
              finalQuery += newFacet;
             //로딩시 first query를 보내면 넘어온 query가 ''이기때문에 AND ~ 로 쿼리가 날아가니까 이상한 결과가 나온다
            // console.log("테스트 finalQuery: " + finalQuery);
            if(finalQuery.startsWith(' AND')){
              finalQuery = finalQuery.substring(4, finalQuery.length);
            }
              console.log("#결과2 : " + finalQuery.trim());
              /***************** NLP 완료 *******************/
  
              Promise.all([fetchDocCount(collectionId, finalQuery)])
                  .then(responses => {
                      const getHighlightingResponse = responses[0];
                      const {response} = getHighlightingResponse.data;
                      //  console.log("#test : "+JSON.stringify(highlighting));
                      const docsCount = response.numFound;
  
                      res.status(200).send({
                          docsCount: docsCount
                      });
  
  
                  }) //end Promise freeTextSearch
                  .catch(promiseErrorHandler("1:"+res))
  
          }) //end nlpRequest
          .catch(promiseErrorHandler("2"+res));
  });

//preview (nlp -> explore{response, highlight})
app.post("/similar-document-query", (req, res) => {
    const collectionId = req.body.collectionId;
    const query = req.body.query || "";
    const docCount = req.body.docCount || 5;
    const start = req.body.start || 0;
    const newFacet = req.body.newFacet || "";
    // console.log("app.js에서 받은 newFacet은 : " + newFacet);

    const nlpData = {
        fields: {
            body: query
        },
        metadata: {}
    };

    const nlpRequest = axios({
        method: "POST",
        url: `${ROOT_URI}/api/v1/collections/${collectionId}/analyze`,
        headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
            accept: "application/json"
        },
        data: nlpData
    });
    Promise.all([nlpRequest])
        .then(responses => {
            const nlpResponse = responses[0]; //miner 화면의 query결과
            const responseData = nlpResponse.data;
            const parseData = responseData.enriched.body[0].annotations;
            const annoLength = parseData.length;
            let annoResult = ''; //나중에 원본 query와 합친다.
            let queryIndex = [];

            //1. 패싯 어노테이션 수집
            let facetvalToCompare = '';
            for(let i=0; i<annoLength; i++){
                if(parseData[i].type === ".unstructure.tech.ai" ||
                    parseData[i].type === ".unstructure.industry" ||
                    parseData[i].type === ".unstructure.application")
                {
                    //tech.ai의 4개 value들이 있는 경우 상위 패싯인 tech로 검색되게 한다.
                    if(parseData[i].type.trim() === ".unstructure.tech.ai"){
                        let mlAnnotation = 'annotation.unstructure.tech:"인공지능"';
                        if(annoResult.indexOf(mlAnnotation) == -1){
                            annoResult += mlAnnotation;
                            annoResult += " AND ";
                        }
                        //일반 어노테이션 처리
                    }else{
                        let path = parseData[i].properties.facetpath.trim();
                        let fval = parseData[i].properties.facetval.trim();
                        facetvalToCompare = fval;

                        let temp = 'annotation' + path + ':"' + fval + '"';
                        annoResult += temp;
                        annoResult += " AND ";
                    }
                  //query중, 어노테이션에 속한 멍사를 제외하기위해 query의 index를 구한다.
                  queryIndex.push(
                    {
                      'beginIndex':parseData[i].beginIndex,
                      'endIndex': parseData[i].endIndex
                    }
                  );        
                }
            } //end 1

              //draw a query index's range
              let size = query.length;
              console.log("query2 : " + query + "\nsize : " + query.length);
              let queryRange = [];
              //init
              for(let i=0; i<size; i++){
                queryRange.push(false);
              }
              //draw queryIndex into queryRange
              for(let i=0; i<queryIndex.length; i++){
                for(j=queryIndex[i].beginIndex; j<=queryIndex[i].endIndex; j++){
                  queryRange[j] = true;
                }
              }
              console.log("결과물2 : " + queryRange);

            //for 2.명사 수집
            for(let i=0; i<annoLength; i++){
                if(parseData[i].type === "._word.noun.general" )
                {
                    // console.log("1 명사는 : " + parseData[i].properties.facetval.trim());
                    //수집한 명사가 어노테이션과 같지 않을때만 문자열에 추가한다.
                    let fval = parseData[i].properties.facetval.trim();
                    let mlToCompare = '인공지능 딥러닝 머신러닝 자연어처리';

                    // console.log("비교문장은 :" + facetvalToCompare);
                    if(facetvalToCompare.indexOf(fval) == -1 && mlToCompare.indexOf(fval) == -1){
                        //query index에서 범위내에 명사가 있는지 검사한다
                        if(queryRange[parseData[i].beginIndex] === true){
                            continue;
                          }else{
                            //i번째 명사의 시작이 queryRande에서 false로 체크된경우에는 명사도 추가해준다.
                            annoResult += fval;
                            annoResult += " AND ";    
                          }
                    }else{
                        // console.log("비교결과:있음");
                    }
                }
            } //end for 2

            let finalQuery = '';
            //miner 검색시 검색어 맨앞,뒤에 OR가 붙으면 검색결과 0개.
            if(annoResult.substr(annoResult.length-4, annoResult.length-1).trim() === "AND"){
                annoResult = annoResult.substr(0, annoResult.length-5);
            }
            if(query === annoResult.trim())
                finalQuery = query;
            else
                finalQuery = annoResult.trim();

            if(newFacet !== '')
                finalQuery += " AND ";
            finalQuery += newFacet;

            //로딩시 first query를 보내면 넘어온 query가 ''이기때문에 AND ~ 로 쿼리가 날아가니까 이상한 결과가 나온다
            // console.log("테스트 finalQuery: " + finalQuery);
            if(finalQuery.startsWith(' AND')){
              finalQuery = finalQuery.substring(4, finalQuery.length);
            }
            
            console.log("#결과 preview : " + finalQuery.trim());
            /***************** NLP 완료 *******************/

            const facetUriToBeAdded =
                'facet=on'
                + '&facet.field=annotation.unstructure.tech'
                + '&facet.field=annotation.unstructure.industry'
                + '&facet.field=annotation.unstructure.application';

            Promise.all([fetchDocPreview(collectionId, finalQuery, start, docCount, facetUriToBeAdded)])
                .then(responses => {

                    const getHighlightingResponse = responses[0];
                    const {response, highlighting, facet_counts} = getHighlightingResponse.data;
                    //  console.log("#test : "+JSON.stringify(highlighting));
                    const docs = response.docs;

                    //S : Data for FacetCard
                    const annoTech =  facet_counts.facet_fields[`annotation.unstructure.tech`]; //그냥 facet_fields.annotation.unstructure하면 json 구조가 깨져서 에러남.
                    const annoIndustry = facet_counts.facet_fields[`annotation.unstructure.industry`];
                    const annoApplication = facet_counts.facet_fields[`annotation.unstructure.application`];
                    // console.log("#11 : " + annoTech);
                    let facetsArray = [];
                    let facetCountToGet = 10;
                    let facetsCount = facetCountToGet*2;
                    let assemble = (annoArray) => {
                        if(annoArray == undefined){
                            //받아온 어노테이션 배열이 없는경우 빈객체를 5개 채워준다.
                            let emptyJson = {value:'undefined',count:0};
                            for(let i=0; i<facetCountToGet; i++)
                                facetsArray.push(emptyJson);
                        }
                        else{
                            for( let i=0; i< facetsCount; i+=2){
                                // console.log("#Annotation Arrays : "+annoArray.toString())
                                let tempJson;
                                if(annoArray[i] == undefined){
                                    tempJson = {value:"undefined", count:0, check:false};
                                }else{
                                    tempJson = {value:annoArray[i], count:annoArray[i+1], check:false};
                                }
                                facetsArray.push(tempJson);
                            }
                        }
                    };
                    assemble(annoTech);
                    assemble(annoIndustry);
                    assemble(annoApplication);
                    //E : Data for FacetCard

                    res.status(200).send({
                        docs: docs  //array
                            .map(addHighlighting(highlighting)), //similar에서는 addUserDefinedAnnotations에서 ___annotaions들을 반환하고, basic에서는 addHighlightingAndUserDefinedAnnotations에서 ___ano..를 반환한다.
                        facetFields: facetsArray,
                        prevFacet: newFacet
                    });


                }) //end Promise freeTextSearch
                .catch(promiseErrorHandler("1:"+res))

        }) //end nlpRequest
        .catch(promiseErrorHandler("2"+res));
});

//wordcloud data
app.post("/word-cloud-query", (req, res) => {
  // console.log("in...");

  const collectionId = req.body.collectionId;
  const query = req.body.query || "";
  const docCount = req.body.docCount || 5;
  // console.log(collectionId + ',' + query + ', ' + docCount);
   
  let fileNameQuery = 'FileName:"' + query.substr(32, query.length-1) + '"';
  // console.log("잘라낸 쿼리는 : " + fileNameQuery);

  const freeTextSearch = axios({
      method: "POST",
      headers: { //기본적으로 onewex api 요청할때 필요한 token이다. ip/docs/ 가면나와있음.
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/x-www-form-urlencoded"
      },
      data: queryString.stringify({
          q: fileNameQuery,
          wt: "json",
          rows: docCount,  //속도에 영향 //fetchHighlight의 rows수도 맞춰줘야한다.
          preview: true //preview 팝업을 켜는 옵션

      }),
      url: `${STD_API_URI}/explore/${collectionId}/query`, //F12로 request header 열어서 정보확인
  });
// now(5);
  Promise.all([freeTextSearch])
      .then(responses => {
//  now(14);

          const freeTextResponse = responses[0];
          const { response, previews } = freeTextResponse.data;
          // const {highlighting} = getHighlightingResponse.data;
          //  console.log("#test : "+JSON.stringify(response));
          const docs = response.docs;

          res.status(200).send({
              docs: docs  //array
                  .map(addHighlightingAndUserDefinedAnnotations(previews))
          });

      }) //end Promise freeTextSearch
      .catch(promiseErrorHandler("1:"+res))
}) //end nlpRequest

//fisrt query
app.post("/first-query", (req, res) => {
  const collectionId = req.body.collectionId;
  const query = req.body.query || "";
  const facetUriToBeAdded =
      'facet=on'
      + '&facet.field=annotation.unstructure.tech'
      + '&facet.field=annotation.unstructure.industry'
      + '&facet.field=annotation.unstructure.application';

  const firstPreview = (query, collectionId, facetUriToBeAdded) =>
  axios({
      method: "POST",
      headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/x-www-form-urlencoded"
      },
      data: queryString.stringify({
          q: query,
          wt: "json"
      }),
      url: `${STD_API_URI}/explore/${collectionId}/query?${facetUriToBeAdded}` //F12로 request header 열어서 정보확인
  });
  // console.log('being start api')
  // console.log('query, cid : ' + query + ', ' + collectionId)
  Promise.all([firstPreview(query, collectionId, facetUriToBeAdded)])
      .then(responses => {
        // console.log('get response 1')
          const getHighlightingResponse = responses[0];
          const {response, highlighting, facet_counts} = getHighlightingResponse.data;
          //  console.log("#test : "+JSON.stringify(highlighting));

          //S : Data for FacetCard
          const annoTech =  facet_counts.facet_fields[`annotation.unstructure.tech`]; //그냥 facet_fields.annotation.unstructure하면 json 구조가 깨져서 에러남.
          const annoIndustry = facet_counts.facet_fields[`annotation.unstructure.industry`];
          const annoApplication = facet_counts.facet_fields[`annotation.unstructure.application`];
          // console.log("#11 : " + annoTech);
          let facetsArray = [];
          let facetCountToGet = 10;
          let facetsCount = facetCountToGet*2;
          let assemble = (annoArray) => {
              if(annoArray == undefined){
                  //받아온 어노테이션 배열이 없는경우 빈객체를 5개 채워준다.
                  let emptyJson = {value:'undefined',count:0};
                  for(let i=0; i<facetCountToGet; i++)
                      facetsArray.push(emptyJson);
              }
              else{
                  for( let i=0; i< facetsCount; i+=2){
                      // console.log("#Annotation Arrays : "+annoArray.toString())
                      let tempJson;
                      if(annoArray[i] == undefined){
                          tempJson = {value:"undefined", count:0, check:false};
                      }else{
                          tempJson = {value:annoArray[i], count:annoArray[i+1], check:false};
                      }
                      facetsArray.push(tempJson);
                  }
              }
          };
          assemble(annoTech);
          assemble(annoIndustry);
          assemble(annoApplication);
          //E : Data for FacetCard
          let firstDocCount = response.numFound;
          console.log('calculate finished')
          res.status(200).send({
              facetFields: facetsArray,
              docsCount: firstDocCount
          });

      }) //end Promise freeTextSearch
      .catch(promiseErrorHandler("1:"+res))

});

//first preview
app.post("/fetch-first-docs", (req, res) => {
  const collectionId = req.body.collectionId;
  const query = req.body.query || "";
  const docCount = req.body.docCount || 5;
  const start = req.body.start || 0;

  const fetchFirstPreview = (collectionId, query, start, docCount) =>
  axios({
      method: "POST",
      headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/x-www-form-urlencoded"
      },
      data: queryString.stringify({
          q: query,
          wt: "json",
          rows: docCount,
          start: start
      }),
      url: `${STD_API_URI}/explore/${collectionId}/query` //F12로 request header 열어서 정보확인
  });

  Promise.all([fetchFirstPreview(collectionId, query, start, docCount)])
      .then(responses => {

          const getHighlightingResponse = responses[0];
          const {response, highlighting} = getHighlightingResponse.data;
          const docs = response.docs;
        console.log("log:"+JSON.stringify(highlighting));
          res.status(200).send({
              docs: docs  //array
                  .map(addHighlighting(highlighting))
         });
      }) //end Promise freeTextSearch
      .catch(promiseErrorHandler("1:"+res))

});