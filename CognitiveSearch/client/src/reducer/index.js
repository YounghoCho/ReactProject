/**
 * Redux's reducers
 * Please refer to https://redux.js.org/basics/reducers
 */
import { combineReducers } from "redux";
import {
  SET_CURRENT_COLLECTION,
  SET_COLLECTIONS,
  REQUEST_COLLECTIONS
  // ,
  // SET_CURRENT_COLLECTION_DOC_COUNT
} from "../action";

let collections = (
  state = {
    isFetching: false,
    currentItem: { name: "", id: "" },
    items: [],
    currentCollectionDocCount: 0,
  },
  action
) => {
  switch (action.type) {
    case SET_COLLECTIONS:
      return Object.assign({}, state, {
        items: action.collections,
        isFetching: false
      });
    case SET_CURRENT_COLLECTION:
      let collections = state.items;
      let collectionCount = state.items.length;
      let targetItem = null;
      for (let i = 0; i < collectionCount; i++) {
        if (collections[i].id === action.collectionId) {
          targetItem = collections[i];
        }
      }
      return Object.assign({}, state, { currentItem: targetItem });
    case REQUEST_COLLECTIONS:
      return Object.assign({}, state, {
        isFetching: true
      });
    // case SET_CURRENT_COLLECTION_DOC_COUNT:
    //   return Object.assign({}, state, {
    //     currentCollectionDocCount: action.docCount
    //   })
    default:
      return state;
  }
};

export default combineReducers({
  collections
});
