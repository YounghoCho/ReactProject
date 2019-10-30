import axios from "axios";

const ROOT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;

    //Axios Cancellation 0.15버전부터 작동.
    let CancelToken = axios.CancelToken;
    let cancelFunction;
    export let cancel = [];

export const fetchPreviewResult = (
    collectionId,
    query,
    newFacet
) =>
    axios({
        url: `${ROOT_URI}/preview-query`,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            collectionId,
            query,
            newFacet
        }
    }).then(response => response.data);


export const fetchSimilarDocumentQueryResult = (
  collectionId,
  query,
  docCount,
  start,
  newFacet
) =>
  axios({
    url: `${ROOT_URI}/similar-document-query`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query,
      docCount,
      start,
      newFacet
    }
  }).then(response => response.data);


export const fetchFirstDocsResult = (
  collectionId,
  query,
  docCount,
  start
) =>
  axios({
    url: `${ROOT_URI}/fetch-first-docs`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query,
      docCount,
      start
    }
  }).then(response => response.data);
  //first
  export const fetchFirstQueryResult = (
    collectionId,
    query
  ) =>
    axios({
      url: `${ROOT_URI}/first-query`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        collectionId,
        query
      }
    }).then(response => response.data);

export const fetchWordCloudResult = (
  index, //0~9
  collectionId,
  query,
  docCount,
  newFacet
) =>{

  return axios({
    url: `${ROOT_URI}/word-cloud-query`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query,
      docCount,
      newFacet
    },
    cancelToken: new CancelToken(function executor(c) {
      //캔슬함수 c를 받아서 cancel이라는 함수배열에 넣는다.
      cancelFunction = c;
      cancel.push(cancelFunction);
  })
  }).then(response => response.data);
  
}
export const checkConnectionStatus = () =>
  axios.get(`${ROOT_URI}/connection`).then(response => response.data);


export const getCollectionsDocCount = (collectionId) =>
  axios({
    url: `${ROOT_URI}/getCollectionsDocCount`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId
    }
  }).then(response => response.data);





//   /* NOT USED */
//   /**
//  *
//  * @param {string} collectionId
//  * @param {string} query
//  */
// export const fetchClassifierResult = (collectionId, query) =>
// axios({
//   url: `${ROOT_URI}/classify`,
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   data: {
//     collectionId,
//     query
//   }
// }).then(response => response.data);

// /**
//  *
//  * @param {string} collectionId
//  * @param {string} query
//  * @param {number} docCount
//  */
// export const fetchPhrasalQueryResult = (collectionId, query, docCount) =>
//   axios({
//     url: `${ROOT_URI}/phrasal-query`,
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     data: {
//       collectionId,
//       query,
//       docCount
//     }
//   }).then(response => response.data);

//   /**
//  *
//  * @param {string} collectionId
//  * @param {string} query
//  * @param {number} docCount
//  */
// export const fetchBasicQueryResult = (collectionId, query, docCount) =>
// axios({
//   method: "POST",
//   url: `${ROOT_URI}/basic-query`,
//   headers: {
//     "Content-Type": "application/json"
//   },
//   data: {
//     collectionId,
//     query,
//     docCount
//   }
// }).then(response => response.data);