/* Redux Store

리덕스를 참조하는 스토어를 만들고, 리덕스에서는 실제 컴포넌트들의 상태(state,props)를 전역(action)으로 관리한다.
그냥 리액트에서는 컴포넌트 depth가 깊을수록 props 전달할때 관련없는 모든 부모, 자식 컴포넌트가 props를 전달받아야 하는 복잡성이 있다.
이것을 해소하기 위해 Store를 사용한다.
*/
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk"; //비동기 작업 처리 미들웨어로, 보통 액션 생성자는 액션 객체를 생성할 뿐이지만 thunk를 쓰면 액션 생성자가 액션 객체에 여러가지 작업을 추가로 할 수 있게한다.(1초뒤 보내기, 네트워크 요청, 반복 dispatch등)
import rootReducer from "./reducer";

export default function configureStore(preloadedState) {
  return process.env.NODE_ENV === "production"
    ? createStore(rootReducer, applyMiddleware(thunkMiddleware)) //질문:action/index.js에서 쓰이고 있는것 같은데 확인이 필요하다.  ref : https://velopert.com/3401
    : createStore(
        rootReducer,
        //크롬에서 사용되는 devtool 확장. (크롬 웹스토어에서 Redux Devtools 확장프로그램을 설치해야 쓸수있다. )
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() arg exposes redux state to Redux chrome tool
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(thunkMiddleware)
      );
}
