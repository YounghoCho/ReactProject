/**
 * Redux's actions
 * Please refer to https://redux.js.org/basics/actions
 */
import axios from "axios";
// 무슨 콜렉션들이지?
export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_COLLECTIONS = "SET_COLLECTIONS";
export const REQUEST_COLLECTIONS = "REQUEST_COLLECTIONS";
//.env파일은 어디서 가져오지?
const ROOT_URI =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;
//액션생성함수 : 액션을 만들다.
let setCurrentCollection = collectionId => {
  return {
    //액션 : 상태 변화에 쓰이며 type 필드는 필수다.
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
  //디스패치 : 액션을 발생시키는 함수. 파라미터에는 액션함수가 전달되어 발생하고, 스토어는 리듀서를 실행시켜 해당 액션을 처리하고 새로운 상태를 업데이트한다.
  return dispatch => {
    dispatch(requestCollections());
    return axios
      .get(`${ROOT_URI}/collections`)
      .then(response => response.data) //data랑 collections, collection은  어디서오는거야?
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
        }//액션이 실행되면 어떻게 변하는거야?
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
