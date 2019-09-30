/**
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
//global value for collection field name (콜렉션별 설정에 따라 변할 수 있으며, NLP api 사용시 이 id가 필요하다.)
var globalFieldName = "body"; //default is body
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

// if (!config.collectionId) {
//   baseEventEmitter.emit(
//     "error",
//     'You must fill out "collectionId" inside config.json file located in /server/config.json'
//   );
// }

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

console.log("로그인 시도");
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
console.log("로그인 완료");

// project modules
// const classifierRouter = require("./router/classifierRouter");
// app.use("/classifier", classifierRouter(STD_API_URI, COLLECTION_ID, session));

//const rankerRouter = require("./router/rankerRouter");
//app.use("/ranker", rankerRouter(STD_API_URI, COLLECTION_ID, session));

/**
 * calls real-time NLP API(oneWEX)
 * @param {string} text
 * @param {string} collectionId
 */
const realTimeNLP = (text, collectionId) =>
  axios({
    method: "POST",
    url: `${STD_API_URI}/collections/${collectionId}/analyze`,
    headers: {
      Authorization: `Bearer ${session.token}`
    },
    data: {
      fields: {
        body: text
      },
      metadata: {}
    }
  });
/**
 * 검색 기능 향상을 위해 현재시간을 기록한다.
 */
const now = (num) => {
    let currentDate = new Date();
    let msg = "#" + num + " : ";
    msg += "현재 시간 :" + (currentDate.getHours()-8) + "시"
    msg += currentDate.getMinutes() + "분";
    msg += currentDate.getSeconds() + "초";
    console.log(msg);
}
const log = (str) => {
    console.log("로그 : '" + str + "'");
}
    /**
 * fetches field data
 * @param {string} collectionId
 */
const fetchFields = collectionId =>
  axios({
    method: "GET",
    url: `${STD_API_URI}/collections/${collectionId}`,
    headers: {
      Authorization: `Bearer ${session.token}`
    }
  });

const fetchHighlight = (collectionId, finalQuery, start, docCount) =>
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
        url: `${STD_API_URI}/explore/${collectionId}/query` //F12로 request header 열어서 정보확인
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
            rows: 1 //rows:1 로 지정하면 결과JSON
        }),
        url: `${STD_API_URI}/explore/${collectionId}/query` //F12로 request header 열어서 정보확인
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
        url: `${STD_API_URI}/explore/${collectionId}/query?${facetUriToBeAdded}` //F12로 request header 열어서 정보확인
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
    // log('in');
    // console.dir(doc);
    const docId = doc.id;
    const keys = Object.keys(highlightings[docId]);
    const highlighting = highlightings[docId][keys[2]].join("<br><br>"); //Arr.join : 배열안의 값을 ()안의 내용으로 구분지어서 하나의 값으로 만든다. ref : https://www.codingfactory.net/10450
    return {
      ...doc,
        id: docId,
        ___highlighting: highlighting
    };
};

const addHighlightingAndUserDefinedAnnotations = (
    highlightings,
    previews
) => doc => {
    // console.log("#1 higligihting : " + JSON.stringify(highlightings));
    const docId = doc.id;
    const keys = Object.keys(highlightings[docId]); 
    // v 12.0.2=> keys : body_bigram, body, views //body filed명이 바뀔수도 있으니 key값을 추출한다.
    // v 12.0.3=> keys : FileName,body_bigram,body,views //FileName이 추가됨.

    // console.log("#1 keys[0], keys[2] is : " + keys[0] +","+keys[2]);
    globalFieldName = keys[2];  //=> globalFieldName = body_bigram
    // console.log("#6  : " + JSON.stringify(highlightings[docId].body));
    // console.log("#7  : " + JSON.stringify(highlightings[docId].views.body[0].span));
    // console.log("#8  : " + JSON.stringify(highlightings[docId].views.body.length));

    const highlighting = highlightings[docId][keys[2]].join("<br><br>"); //Arr.join : 배열안의 값을 ()안의 내용으로 구분지어서 하나의 값으로 만든다. ref : https://www.codingfactory.net/10450
    // console.log("#4 highlightings[docId][keys[0]] : " + highlightings[docId][keys[0]].toString());
    const analyzedFacets = previews[docId].analyzed_facets;
    //  console.log("### doc id ? " + docId);
    return {
        ...doc,
        // ___highlighting: highlighting, //preview에서 이미 불러온값
        ___annotations: makeUserDefinedAnnotationList(analyzedFacets) //previews[docId].analyzed_facets; 분석패싯들을 전달하고, 파싱된 어노테이션 list를 return한다.
    };
};

/**
 * parameter for Array.prototype.map()
 * appends highlighting and user-defined annotation data to list of queried documents
 * this function is dedicated for similar document query.
 * @param {Obejct} val
 * @param {Object} val.responseHeader
 * @param {Object} val.response
 * @param {[]} val.response.docs
 * @param {Object} val.preview
 */
const addUserDefinedAnnotations = val => {
  const { responseHeader, response, previews } = val;
  const id = responseHeader.params["___doc_id"];
  const docInfo = response.docs[0];
  const analyzedFacets = previews[id].analyzed_facets;
  return {
    ...docInfo,
    ___annotations: makeUserDefinedAnnotationList(analyzedFacets)
  };
};

const makeUserDefinedAnnotationList = analyzedFacets => {
  let temp,
    fieldName,
    annoName,
    annoList = [],
    splitterIndex,
    indices,
    colorGroup;
  for (fieldName in analyzedFacets) {
    temp = analyzedFacets[fieldName];
    for (annoName in temp) {
      // general noun or user-defined annotation
      // if (
      //  annoName.startsWith("annotation._word.noun.general") ||
      //  (!annoName.startsWith("annotation._") &&
      //   !annoName.startsWith("annotation.subfacet"))
      // ) {
        
      //annotation.subfacet : ._phrase, ._word 등
        //
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
  // console.log("#10 annotaions : " + JSON.stringify(annoList));
  return annoList
    .filter(val => val.annotation.length > 1)
    .sort((prev, next) => next.count - prev.count);
};
//collections api에서 가져온 녀석들중에 
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



//final
app.post("/similar-document-query1", (req, res) => {
    const collectionId = req.body.collectionId;
    const query = req.body.query || "";
    const docCount = req.body.docCount || 5;
    const start = req.body.start || 0;
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
            const nlpResponse = responses[0]; //miner 화면의 query결과
            // console.log("#출력1 : " + fetchSimilarDocumentsResponse.data); //objec 출력
            // console.log("#출력2 : " + fetchSimilarDocumentsResponse.data.toString()); //object 출력
            // console.log("#출력3 : " + JSON.stringify(fetchSimilarDocumentsResponse.data)); //올바른 출력
            const responseData = nlpResponse.data;
            const parseData = responseData.enriched.body[0].annotations;
            const annoLength = parseData.length;
            let annoResult = ''; //나중에 원본 query와 합친다.

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
                }
            } //end 1

            //for 2.명사 수집
            for(let i=0; i<annoLength; i++){
              if(parseData[i].type === "._word.noun.general" )  //_word.noun.others 는 형용사등의 못잡는 단어들이 나옴.
              {
                console.log("1 명사는 : " + parseData[i].properties.facetval.trim());
                  console.log("2 패스는 : " + parseData[i].properties.facetpath.trim());

                  //수집한 명사가 어노테이션과 같지 않을때만 문자열에 추가한다.
                let fval = parseData[i].properties.facetval.trim();
                let mlToCompare = '인공지능 딥러닝 머신러닝 자연어처리';

                  // console.log("비교문장은 :" + facetvalToCompare);
                if(facetvalToCompare.indexOf(fval) == -1 && mlToCompare.indexOf(fval) == -1){
                  // console.log("비교결과:" + "없음");
                  annoResult += fval;
                  annoResult += " AND ";
                }else{
                  // console.log("비교결과:있음");
                }
              }
            } //end for 2      
           
            let finalQuery = '';
            //miner 검색시 검색어 맨앞,뒤에 OR가 붙으면 검색결과 0개.
            if(annoResult.substr(annoResult.length-4, annoResult.length-1).trim() == "AND"){
              annoResult = annoResult.substr(0, annoResult.length-5);
            }
            if(query === annoResult)
                finalQuery = query;
            else
                finalQuery = annoResult;

            if(newFacet != '')
                finalQuery += " AND ";
            finalQuery += newFacet;

            console.log("#결과1 : " + finalQuery);
            /***************** NLP 완료 *******************/
// now(4);
            //error: "Request path contains unescaped characters"
            //원인 : uri 중간에 공백이? 아니 한글이 들어가서 그래..
            //해결 : 해결불가;
            const facetUriToBeAdded =
                'facet=on'
                + '&facet.field=annotation.unstructure.tech'
                + '&facet.field=annotation.unstructure.industry'
                + '&facet.field=annotation.unstructure.application';

            const freeTextSearch = axios({
                method: "POST",
                headers: { //기본적으로 onewex api 요청할때 필요한 token이다. ip/docs/ 가면나와있음.
                    Authorization: `Bearer ${session.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: queryString.stringify({
                    q: finalQuery,
                    wt: "json",
                    rows: docCount,  //속도에 영향 //fetchHighlight의 rows수도 맞춰줘야한다.
                    preview: true, //preview 팝업을 켜는 옵션
                    start : start
                }),
                url: `${STD_API_URI}/explore/${collectionId}/query?${facetUriToBeAdded}`, //F12로 request header 열어서 정보확인
            });
// now(5);
            Promise.all([freeTextSearch, fetchHighlight(collectionId, finalQuery, start, docCount)])
                .then(responses => {
//  now(14);

                    const freeTextResponse = responses[0];
                    const getHighlightingResponse = responses[1];
                    // console.log("## : " + JSON.stringify(getHighlightingResponse.data));

                    const { response, facet_counts, previews } = freeTextResponse.data;
                    const {highlighting} = getHighlightingResponse.data;
                    //  console.log("#test : "+JSON.stringify(highlighting));
                    const docs = response.docs;
                    //S : Data for FacetCard
                    const annoTech =  facet_counts.facet_fields[`annotation.unstructure.tech`]; //그냥 facet_fields.annotation.unstructure하면 json 구조가 깨져서 에러남.
                    const annoIndustry = facet_counts.facet_fields[`annotation.unstructure.industry`];
                    const annoApplication = facet_counts.facet_fields[`annotation.unstructure.application`];
                    // console.log("#11 : " + annoTech);
                    let facetsArray = [];
                    let facetsCount = 5*2;
                    let assemble = (annoArray) => {
                        if(annoArray == undefined){
                            let emptyString = "";
                            facetsArray.push(emptyString);
                            facetsArray.push(emptyString);
                            facetsArray.push(emptyString);
                        }
                        else{
                            for( let i=0; i< facetsCount; i+=2){
                                // console.log("#Annotation Arrays : "+annoArray.toString())
                                let temp;
                                if(annoArray[i] == undefined){
                                  temp = "undefined : 0";  
                                }else{
                                  temp = (annoArray[i] + " : " + annoArray[i + 1]);
                                }
                                facetsArray.push(temp);
                            }
                        }
                    };
                    assemble(annoTech);
                    assemble(annoIndustry);
                    assemble(annoApplication);
                    //E : Data for FacetCard
// now(7);

                    res.status(200).send({
                        docs: docs  //array
                            .map(addHighlightingAndUserDefinedAnnotations(highlighting, previews)), //similar에서는 addUserDefinedAnnotations에서 ___annotaions들을 반환하고, basic에서는 addHighlightingAndUserDefinedAnnotations에서 ___ano..를 반환한다.
                        facetFields: facetsArray
                    });


                }) //end Promise freeTextSearch
                .catch(promiseErrorHandler("1:"+res))

        }) //end nlpRequest
        .catch(promiseErrorHandler("2"+res));
});







app.post("/similar-document-query", (req, res) => {
    const collectionId = req.body.collectionId;
    const query = req.body.query || "";
    const docCount = req.body.docCount || 5;
    const start = req.body.start || 0;
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
// now(2);
    Promise.all([nlpRequest])
        .then(responses => {
// now(3);
            const nlpResponse = responses[0]; //miner 화면의 query결과
            // console.log("#출력1 : " + fetchSimilarDocumentsResponse.data); //objec 출력
            // console.log("#출력2 : " + fetchSimilarDocumentsResponse.data.toString()); //object 출력
            // console.log("#출력3 : " + JSON.stringify(fetchSimilarDocumentsResponse.data)); //올바른 출력

            const responseData = nlpResponse.data;
            const parseData = responseData.enriched.body[0].annotations;
            const annoLength = parseData.length;
            let annoResult = ''; //나중에 원본 query와 합친다.


            for(let i=0; i<annoLength; i++){
                if(parseData[i].type === ".unstructure.tech.ai" ||
                    parseData[i].type === ".unstructure.industry" ||
                    parseData[i].type === ".unstructure.application")
                {

                    annoResult += " OR ";
                    annoResult += parseData[i].properties.facetval.trim();
                }
            } //end for
            let finalQuery = '';
            if(query === annoResult)
                finalQuery = query;
            else
                finalQuery = query + annoResult;

            if(newFacet != '')
                finalQuery += " AND ";
                finalQuery += newFacet;

            console.log("#결과 : " + finalQuery);
            /***************** NLP 완료 *******************/
// now(4);
            //error: "Request path contains unescaped characters"
            //원인 : uri 중간에 공백이? 아니 한글이 들어가서 그래..
            //해결 : 해결불가;

            const facetUriToBeAdded =
                'facet=on'
                + '&facet.field=annotation.unstructure.tech'
                + '&facet.field=annotation.unstructure.industry'
                + '&facet.field=annotation.unstructure.application';

            const freeTextSearch = axios({
                method: "POST",
                headers: { //기본적으로 onewex api 요청할때 필요한 token이다. ip/docs/ 가면나와있음.
                    Authorization: `Bearer ${session.token}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: queryString.stringify({
                    q: finalQuery,
                    wt: "json",
                    rows: docCount,  //속도에 영향 //fetchHighlight의 rows수도 맞춰줘야한다.
                    preview: true, //preview 팝업을 켜는 옵션
                    start : start
                }),
                url: `${STD_API_URI}/explore/${collectionId}/query?${facetUriToBeAdded}`, //F12로 request header 열어서 정보확인
            });

// now(5);
            Promise.all([freeTextSearch, fetchHighlight(collectionId, finalQuery, start, docCount)])
                .then(responses => {
// now(6);

                    const freeTextResponse = responses[0];
                    const getHighlightingResponse = responses[1];
                    // console.log("## : " + JSON.stringify(freeTextResponse.data));

                    const { response, facet_counts, previews } = freeTextResponse.data;
                    const {highlighting} = getHighlightingResponse.data;
                    // console.log("#test : "+JSON.stringify(highlighting));
                    const docs = response.docs;
                    //S : Data for FacetCard
                    const annoTech =  facet_counts.facet_fields[`annotation.unstructure.tech`]; //그냥 facet_fields.annotation.unstructure하면 json 구조가 깨져서 에러남.
                    const annoIndustry = facet_counts.facet_fields[`annotation.unstructure.industry`];
                    const annoApplication = facet_counts.facet_fields[`annotation.unstructure.application`];
                    // console.log("#11 : " + annoTech);
                    let facetsArray = [];
                    let facetsCount = 5*2;
                    let assemble = (annoArray) => {
                        if(annoArray == undefined){
                            let emptyString = "";
                            facetsArray.push(emptyString);
                            facetsArray.push(emptyString);
                            facetsArray.push(emptyString);
                        }
                        else{
                            for( let i=0; i< facetsCount; i+=2){
                                // console.log("#Annotation Arrays : "+annoArray.toString())
                                let temp = (annoArray[i] + " : " + annoArray[i + 1]);
                                facetsArray.push(temp);
                            }
                        }
                    };
                    assemble(annoTech);
                    assemble(annoIndustry);
                    assemble(annoApplication);
                    //E : Data for FacetCard
// now(7);

                    res.status(200).send({
                        docs: docs  //array
                            .map(addHighlightingAndUserDefinedAnnotations(highlighting, previews)), //similar에서는 addUserDefinedAnnotations에서 ___annotaions들을 반환하고, basic에서는 addHighlightingAndUserDefinedAnnotations에서 ___ano..를 반환한다.
                        facetFields: facetsArray
                    });


                }) //end Promise freeTextSearch
                .catch(promiseErrorHandler("1:"+res))

        }) //end nlpRequest
        .catch(promiseErrorHandler("2"+res));
});
