/* Web Storage API 사용

브라우저에서 Key/Value형태로 데이터를 저장하며 쿠키보다 직관적이다.
getItem, setItem 메소드로 데이터를 저장한다
두개 메커니즘이 있는데 sessionStorage(세션유지동안 씀), localStorage(브라우저 닫혀도 유지)

이 앱에선 app.js에서 defaultcollectionid를 저장할때 쓰인다.
*/
class BrowserStorage {
  constructor() {
    if (!this.storageAvailable("localStorage")) { //브라우저에서 localStorage가 지원되는지 확인
      throw new Error("localStorage not available for your browser");
    }
  }

  storageAvailable = type => {
    try {
      var storage = window[type], //두 메커니즘은 window객체에서 제공한다.
        x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        //QuotaExceededError는 private모드 브라우저에서는 저장공간이 없어 발생하는 에러다.
        storage.length !== 0
      );
    }
  };

  getItem(key) {
    return localStorage.getItem(key);
  }

  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  clear() {
    localStorage.clear();
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }
}

export const browserStorage = new BrowserStorage();
