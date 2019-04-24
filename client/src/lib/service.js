//서버쪽으로 요청을 보내는 부분이다.

import axios from "axios";

const ROOT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;

/**
 * 참고 변수명
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
  docCount
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
      test
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
