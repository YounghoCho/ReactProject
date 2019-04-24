import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import configureStore from "./configureStore";
//import registerServiceWorker from './registerServiceWorker';

//원래를 아래 처럼 만드는 것인데, configureStore.js로 한번 구조화 시켰다. 
 //const store = createStore(rootReducer);
const store = configureStore();

//react-redux 라이브러리의 <Provider>컴포넌트를 사용해서 props로 store를 Provider에게 넣어주면, 리액트 프로젝트에 스토어가 연동된다.
ReactDOM.render(
  <Provider store={store}>  
    <App />
  </Provider>,
  document.getElementById("root")
);
//registerServiceWorker();
//registerServiceWorker는 빼도 무방하다
//The service worker is a web API that helps you cache your assets and other files so that when the user is offline or on slow network, he/she can still see results on the screen.
//it helps you build a better user experience
