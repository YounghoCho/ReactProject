import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./reducer";

export default function configureStore(preloadedState) {
  return process.env.NODE_ENV === "production"
    ? createStore(rootReducer, applyMiddleware(thunkMiddleware))
    : createStore(
        rootReducer,
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() arg exposes redux state to Redux chrome tool
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__(),
        applyMiddleware(thunkMiddleware)
      );
}
