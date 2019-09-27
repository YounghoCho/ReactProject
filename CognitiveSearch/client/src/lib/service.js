import axios from "axios";

const ROOT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;

/**
 *
 * @param {string} collectionId
 * @param {string} query
 * @param {number} docCount
 */


export const fetchBasicQueryResult = (collectionId, query, docCount) =>
  axios({
    method: "POST",
    url: `${ROOT_URI}/basic-query`,
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query,
      docCount
    }
  }).then(response => response.data);

/**
 *
 * @param {string} collectionId
 * @param {string} query
 */
export const fetchClassifierResult = (collectionId, query) =>
  axios({
    url: `${ROOT_URI}/classify`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query
    }
  }).then(response => response.data);

/**
 *
 * @param {string} collectionId
 * @param {string} query
 * @param {number} docCount
 */
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

/**
 *
 * @param {string} collectionId
 * @param {string} query
 * @param {number} docCount
 */
export const fetchPhrasalQueryResult = (collectionId, query, docCount) =>
  axios({
    url: `${ROOT_URI}/phrasal-query`,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId,
      query,
      docCount
    }
  }).then(response => response.data);

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