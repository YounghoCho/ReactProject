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

// let changeDocCountWithCurrentCollection = collectionId => {
//   return dispatch => {
//     dispatch(setCurrentCollection(collectionId))
//     return getCurrentCollectionDocs()
//       .then(count => dispatch(setCurrentCollectionDocsCount(count)))
//       .catch(err => console.error(err));
//   }
// }
let changeDocCountWithCurrentCollection = collectionId => {
  return dispatch => {
    dispatch(setCurrentCollection(collectionId))  
    return getCurrentCollectionDocs(collectionId)
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
  // console.log("반환값 : " + docCount)
  return {
    type: SET_CURRENT_COLLECTION_DOC_COUNT,
    docCount
  }
}


//컬렉션 전체문서 얻기
let getCurrentCollectionDocs = (defaultCollectionId) => 
  axios({
    method: "GET",
    url: `${ROOT_URI}/collections/status`
  })
  // .then(response => response.data)//count리턴
  .then(response => {
//  console.log("#추출 : "+ JSON.stringify(response.data));
// console.log("#defaultCollectionId : " + defaultCollectionId);
    const items = response.data.items;
    for(let i=0; i<items.length; i++){
      let tempCollectionId = items[i].docproc.collectionID;
      // console.log("cid : " + tempCollectionId);
      if(tempCollectionId == defaultCollectionId){
        setCurrentCollectionDocsCount(items[i].docproc.numberOfIndexedDocs);
        break;
      }
    }
  })
  .catch(error => console.error("[err2]getCurrentCollectionDocs에러 : " + error.message));

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
      }).then(getCurrentCollectionDocs(defaultCollectionId))  //모든 곳에서 this.props.currentItemDocCount로 사용 가능하다.
  };
};

export {
  setCurrentCollection,
  setCollections,
  requestCollections,
  fetchCollections,
  changeDocCountWithCurrentCollection
};
