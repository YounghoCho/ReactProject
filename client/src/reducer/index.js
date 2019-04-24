/**
 * Redux's reducers
 * Please refer to https://redux.js.org/basics/reducers
 */
import { combineReducers } from "redux";
import {
  SET_CURRENT_COLLECTION,
  SET_COLLECTIONS,
  REQUEST_COLLECTIONS
} from "../action";
//리듀서는 인자로 state, action을 갖는다. 전달받은 action을 처리해 새로운 state를 return함.
let collections = (
  state = {
    isFetching: false,
    currentItem: { name: "", id: "" },
    items: []
  },
  action //action객체를 알아서 물고온다.
) => {
  switch (action.type) {//공통으로 있는 type을 switch로 분별한다.
    case SET_COLLECTIONS:
      //Object.assign(to, from, from) : 뒤의 객체들을 맨 앞 객체로 복사한다. ref : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/assign 
      return Object.assign({}, state, { 
        items: action.collections, //각 case별로 action에서 정의하고 있는 변수를 가져온다.
        isFetching: false
      });
    case SET_CURRENT_COLLECTION:
      let collections = state.items;
      let collectionCount = state.items.length;
      let targetItem = null;
      for (let i = 0; i < collectionCount; i++) {
        if (collections[i].id === action.collectionId) { //여기서는 action객체에 collectionId를 선언했기때문에 이 값이 온다.
          targetItem = collections[i];
        }
      }
      return Object.assign({}, state, { currentItem: targetItem });
    case REQUEST_COLLECTIONS:
      return Object.assign({}, state, {
        isFetching: true
      });
    default:
      return state;
  }
};
//멀티리듀서 combineReducers를 사용했다.
//여러 리듀서를 하나로 합치는 작업인데 여기서는 한개의 리듀서만 있다.
// 각 리듀서는 subReducer라 불리고, 합쳐진 리듀서를 rootReducer라 부른다. => configureStore.js에서 rootReducer라는 이름으로 호출되어 스토어를 생성한다.
export default combineReducers({
  collections //리듀서 명 collections는 어디서 호출될까? export default라는 함수에 의해서 Store에서 자동으로 등록하게 된다!
});
