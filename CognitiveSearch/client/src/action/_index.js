/**
 * Redux's actions
 * Please refer to https://redux.js.org/basics/actions
 */
import axios from "axios";

export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_COLLECTIONS = "SET_COLLECTIONS";
export const REQUEST_COLLECTIONS = "REQUEST_COLLECTIONS";
export const SET_CURRENT_COLLECTION_DOC_COUNT = "SET_CURRENT_COLLECTION_DOC_COUNT";

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

let changeCurrentCollection = collectionId => {
  return dispatch => {
    dispatch(setCurrentCollection(collectionId))
    return getCurrentCollectionDocs()
      .then(count => dispatch(setCurrentCollectionDocsCount(count)))
      .catch(err => console.error(err));
  }
}

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

let setCurrentCollectionDocsCount = (docCount) => {
  return {
    type: SET_CURRENT_COLLECTION_DOC_COUNT,
    docCount
  }
}


//컬렉션 전체문서 얻기
let getCurrentCollectionDocs = () => 
  axios({
    method: "GET",
    url: `${ROOT_URI}/collections/status`
  })
  // .then(response => response.data)//count리턴
  .then(response => console.log("#추출 : "+ JSON.stringify(response.data)))

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
      }).then(getCurrentCollectionDocs())  //모든 곳에서 this.props.currentItemDocCount로 사용 가능하다.
      //.then(count => dispatch(setCurrentCollectionDocsCount(count)))  //60line에서 얻어온 count를 넘긴다.
      //.catch(error => console.error(error.message));
  };
};

export {
  setCurrentCollection,
  setCollections,
  requestCollections,
  fetchCollections
};
