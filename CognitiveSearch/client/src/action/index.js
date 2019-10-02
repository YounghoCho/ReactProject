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
    let count = 0;
    for(let i=0; i<items.length; i++){
      let tempCollectionId = items[i].docproc.collectionID;
      // console.log("cid : " + tempCollectionId);
      if(tempCollectionId === defaultCollectionId){
        count = items[i].docproc.numberOfIndexedDocs;
        break;
      }
    }
    // console.log(count);
    return count;
  })
  .catch(error => console.error("[err2]getCurrentCollectionDocs에러 : " + error.message));

let fetchCollections = defaultCollectionId => {
  return dispatch => {
    dispatch(requestCollections());
    return axios
      .get(`${ROOT_URI}/collections`)
      .then(response => response.data)
      .then(response => {
        // console.log(JSON.stringify(response.collections.id));
        let mappedCollections = response.collections.map(
          collection => ({
            id: collection.id,
            name: collection.name
          })
        );
        let isCollectionFound = false;
        //최초 접속해서 해당 브라우저의 사용자가 collections을 선택한 적 없을 경우
        // console.log(mappedCollections[0]);
        let customCollectionId = 'e8d1c521-b10b-f9be-0000-016d3dfc800c';
        mappedCollections = mappedCollections.filter(info => info.id == customCollectionId);
        isCollectionFound = true;
        //OriginalCode : 컬렉션들중에 선택한 컬렉션을 지정해준다.
        // if (defaultCollectionId) {
        //   for (let i = 0, count = mappedCollections.length; i < count; i++) {
        //     if (mappedCollections[i].id === defaultCollectionId) {  //defaultCollectionId은 CollectionSelect에서 선택된 컬렉션 id값
        //       isCollectionFound = true;
        //       break;
        //     }
        //   }
        // }
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
      //  return defaultCollectionId; //중요 : 여기서 response => {}에 대한 return을 안해주면, 아래 then이 비동기 처리가 되지 않는다. getCurrentCollectionDocs의 결과가 먼저 나오는 현상 발생
      })
      //   .then(getCurrentCollectionDocs) //중요 : 여기서는 파라미터를 왜 안넘길까? return defaultCollectionId를 받아오기때문에 자동으로 넘어간다!
      // .then(count => {
      //   // console.log(count);
      //   dispatch(setCurrentCollectionDocsCount(count))  //중요 : 그냥 setCurrent~하면 안되고 dispatch로 실행해준다.
      // });  //이제 모든 곳에서 this.props.currentItemDocCount로 사용 가능하다.

    /*문서수 구하려면 115~121 주석 해제*/
  };
};

export {
  setCurrentCollection,
  setCollections,
  requestCollections,
  fetchCollections,
  changeDocCountWithCurrentCollection
};
