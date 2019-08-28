/**
 * Redux's actions
 * Please refer to https://redux.js.org/basics/actions
 */
import axios from "axios";

export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_COLLECTIONS = "SET_COLLECTIONS";
export const REQUEST_COLLECTIONS = "REQUEST_COLLECTIONS";

const ROOT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;

let setCurrentCollection = collectionId => {
  return {
    type: SET_CURRENT_COLLECTION,
    collectionId
  };
};

let setCollections = collections => {
  return {
    type: SET_COLLECTIONS,
    collections
  };
};

let requestCollections = () => {
  return {
    type: REQUEST_COLLECTIONS
  };
};

let fetchCollections = defaultCollectionId => {
  return dispatch => {
    dispatch(requestCollections());
    return axios
      .get(`${ROOT_URI}/collections`)
      .then(response => response.data)
      .then(response => {
        let mappedCollections = response.collections.map(collection => ({
          id: collection.id,
          name: collection.name
        }));
        let isCollectionFound = false;
        if (defaultCollectionId) {
          for (let i = 0, count = mappedCollections.length; i < count; i++) {
            if (mappedCollections[i].id === defaultCollectionId) {
              isCollectionFound = true;
              break;
            }
          }
        }
        dispatch(setCollections(mappedCollections));
        dispatch(
          setCurrentCollection(
            isCollectionFound
              ? defaultCollectionId
              : mappedCollections.length > 0
                ? mappedCollections[0].id
                : ""
          )
        );
      })
      .catch(error => console.error(error.message));
  };
};

export {
  setCurrentCollection,
  setCollections,
  requestCollections,
  fetchCollections
};
