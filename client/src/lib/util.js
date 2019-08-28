class BrowserStorage {
  constructor() {
    if (!this.storageAvailable("localStorage")) {
      throw new Error("localStorage not available for your browser");
    }
  }

  storageAvailable = type => {
    try {
      var storage = window[type],
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
