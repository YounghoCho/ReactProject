/**
 * Redux's actions
 * Please refer to https://redux.js.org/basics/actions
 */
import axios from "axios";
//export 변수인 이유는 ../reducer에서 import해서 쓰기위해서이다.
export const SET_CURRENT_COLLECTION = "SET_CURRENT_COLLECTION";
export const SET_COLLECTIONS = "SET_COLLECTIONS";
export const REQUEST_COLLECTIONS = "REQUEST_COLLECTIONS";

/*process.env

env는 command에 쳐보면 리눅스의 모든 환경번수들을 출력한다.
즉 nodejs가 사용할 시스템의 환경변수를 정의하는 파일이며 process.env 방식으로 호출해서 사용한다.
*/
const ROOT_URI =
  process.env.NODE_ENV !== "production" //질문 : .env 파일은 자동으로 설정파일로 인식되어 읽어올 수 있는건가?
    ? "http://localhost:3100"
    : process.env.REACT_APP_KA_API_URL;
//액션함수
let setCurrentCollection = collectionId => {
  return {
    //액션
    type: SET_CURRENT_COLLECTION, //현재 선택된 컬렉션
    collectionId
  };
};

let setCollections = collections => {
  return {
    type: SET_COLLECTIONS, //api로 불러온 콜렉션들
    collections
  };
};

let requestCollections = () => {
  return {
    type: REQUEST_COLLECTIONS //조회 할 콜렉션
  };
};

let fetchCollections = defaultCollectionId => {
  //액션실행함수
  return dispatch => {
    dispatch(requestCollections()); //인자로 액션함수를 전달하면, 스토어에서 리듀서에게 알려 state를 변화시킴
    return axios //axio로 HTTP request를 보낸다.
      .get(`${ROOT_URI}/collections`) //server/api/app.js의 /collections 라우터로 요청 전송.
      .then(response => response.data) //es6 arrow funcion: function(res){return res.data}와 같다. 즉, 라우터에서 onewex 콜렉션 api응답인 response.data.items을 담아서 보낸게 response.data인데 이게 response라는 변수에 담긴다.
      .then(response => {
        //res.data를 한번더 까면 비로소 전달받은 collections객체(res.data.items)를 볼수있다.
        let mappedCollections = response.collections.map(collection => ({ //collection 익명변수에는 호이스팅으로 response.data(items)가 들어온다.
          id: collection.id, //items.id를 map시켜서 새로운 let변수를 만든다.
          name: collection.name
        }));
        let isCollectionFound = false;
        if (defaultCollectionId) { //읽어올 콜렉션 개수만큼 반복하면서 default로 등록된 collection 아이디와 일치하면 종료한다.
          for (let i = 0, count = mappedCollections.length; i < count; i++) {
            if (mappedCollections[i].id === defaultCollectionId) {
              isCollectionFound = true;
              break;
            }
          }
        }
        dispatch(setCollections(mappedCollections)); //가져온 collection 들을 저장하고
        dispatch( //현재 컬렉션을 저장해준다.
          setCurrentCollection(
            isCollectionFound
              ? defaultCollectionId
              : mappedCollections.length > 0
                ? mappedCollections[0].id //첫번째 콜렉션을 보여주거나
                : ""  //콜렉션이 없으면 빈칸을 출력한다.
          )
        );
      })
      .catch(error => console.error(error.message));
  };
};

export {
  setCurrentCollection, //App.js 에서 사용
  setCollections, //여기서만 사용
  requestCollections, //여기서만 사용
  fetchCollections //App.js  에서 사용
};
