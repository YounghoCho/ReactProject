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
const addHighlightingAndUserDefinedAnnotations = (
  highlightings,
  previews
) => doc => { //doc은 어디서 오는 객체?
  // console.log("doc? : " + doc);
  // console.log("highlights : " + JSON.stringify(highlightings));
   const docId = doc.id;
   const keys = Object.keys(highlightings[docId]); //body filed명이 바뀔수도 있으니 key값을 추출한다.
  //  console.log("sum? " + keys[0]); //body or sum or 내가 설정한 콜렉션의 body field.
  globalFieldName = keys[0];

  const highlighting = highlightings[docId][keys[0]].join("\n"); //Arr.join : 배열안의 값을 ()안의 내용으로 구분지어서 하나의 값으로 만든다. ref : https://www.codingfactory.net/10450
   const analyzedFacets = previews[docId].analyzed_facets;
   console.log("### doc id ? " + docId);
   return {
    ...doc,
    ___highlighting: highlighting,
    ___annotations: makeUserDefinedAnnotationList(analyzedFacets)
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
    indices;
  for (fieldName in analyzedFacets) {
    temp = analyzedFacets[fieldName];
    for (annoName in temp) {
      // general noun or user-defined annotation
      if (
        annoName.startsWith("annotation._word.noun.general") ||
        (!annoName.startsWith("annotation._") &&
          !annoName.startsWith("annotation.subfacet"))
      ) {
        splitterIndex = annoName.indexOf("$") + 1;
        indices = temp[annoName];
        annoList.push({
          annotation: annoName.slice(splitterIndex),
          indices,
          count: indices.length
        });
      }
    }
  }
  return annoList
    .filter(val => val.annotation.length > 1)
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
    url: `${STD_API_URI}/explore/${collectionId}/query`
  });

  Promise.all([basicQuery, fetchFields(collectionId)])
    .then(responses => {
      const basicQueryResponse = responses[0];
      const fetchFieldsResponse = responses[1];
      // console.log("token : " + session.token);
      //  console.log("#2 : " + JSON.stringify(basicQueryResponse.data));
     //  console.log("#3 : " + JSON.stringify(fetchFieldsResponse.data));
      
      const { response, highlighting, previews } = basicQueryResponse.data;
      const docs = response.docs;
      //  console.log("docs? : " + docs);
      const { tags, fields } = fetchFieldsResponse.data;
      const fieldMap = makeFieldMap(tags, fields);
      // console.log("highlighting : " + highlighting);
      // console.log("previews : " + previews);
      res.status(200).send({
        docs: docs
         .map(addHighlightingAndUserDefinedAnnotations(highlighting, previews))
         .map(mapFieldLabel(fieldMap))
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
    let query = phrase;
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
//NLP 검색 api의 형태를 따르고 similar document search를 수행한다.
app.post("/similar-document-query", (req, res) => {
  const collectionId = req.body.collectionId;
  const query = req.body.query || "";
  const docCount = req.body.docCount || 20;
  const qdoc = {
    fields: {
      body: query
    },
    metadata: {}
  };

  const fetchSimilarDocuments = axios({
    method: "POST",
    url: `${ROOT_URI}/miner/main/rapi/solr/${collectionId}/query`, //F12로 request header 열어서 정보확인
    headers: { //기본적으로 onewex api 요청할때 필요한 token이다. ip/docs/ 가면나와있음.
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: queryString.stringify({ //f12에 Form Data
      q: "*:*",
      shortCircuit: false,
      qdoc: JSON.stringify(qdoc),
      rq: "{!sss}",
      rows: docCount,
      start: 0,
      wt: "json"
    })
  });

  Promise.all([fetchSimilarDocuments, fetchFields(collectionId)]) //fetchFields는 api/v1/collections로 콜렉션 리스트를 가져옴.
    .then(responses => {
      const fetchSimilarDocumentsResponse = responses[0]; //miner 화면의 query결과
      const fetchFieldsResponse = responses[1]; //onewex api 결과

      const docs = fetchSimilarDocumentsResponse.data.response.docs; //f12에 data는 없지만 JSON객체 root에 접근하는 default 명칭임.
      const { tags, fields } = fetchFieldsResponse.data;
      const fieldMap = makeFieldMap(tags, fields);

      let promises = [];
      let tempDocId;
      for (let i = 0, docCount = docs.length; i < docCount; i++) {
        tempDocId = docs[i].id || "";
        promises.push( //다시한번 api요청을 반복(for)요청 하는데 doc_id와 쿼리에 tempDocId를 넣어서 각각의 document를 response로 보낸다. 
          axios({
            method: "POST",
            url: `${ROOT_URI}/miner/main/rapi/solr/${collectionId}/query`,
            headers: {
              Authorization: `Bearer ${session.token}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: queryString.stringify({
              preview: true,
              q: `id:"${tempDocId}" AND *:*`,
              shortCircuit: false,
              start: 0,
              rows: 1,
              wt: "json",
              ___doc_id: tempDocId
            })
          })
        );
      }
      return Promise.all(promises)
        .then(responses => {
          res.status(200).send({
            docs: responses
              .map(response => response.data)
              .map(addUserDefinedAnnotations)
              .map(mapFieldLabel(fieldMap))
          });
        })
        .catch(promiseErrorHandler(res));
    })
    .catch(promiseErrorHandler(res));
});
