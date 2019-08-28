/**
 * This file is for declaring constants
 */

/**
 * CONSTANT FOR UI TEXTS
 * Basic form of writing string constants:
 * "ko-KR": "",
 * ko: "",
 * "en-US": "",
 *  en: ""
 */
const STRINGS = {
  // Common string
  ERROR: {
    "ko-KR": "에러",
    ko: "에러",
    "en-US": "Error",
    en: "Error"
  },
  CONNECTION_ERROR: {
    "ko-KR": "서버 연결 에러",
    ko: "서버 연결 에러",
    "en-US": "Server Connection Error",
    en: "Server Connection Error"
  },
  // Query mode
  BASIC_SEARCH: {
    "ko-KR": "일반 검색",
    ko: "일반 검색",
    "en-US": "Basic Search",
    en: "Basic Search"
  },
  SIMILAR_DOCUMENT_SEARCH: {
    "ko-KR": "유사문서 검색",
    ko: "유사문서 검색",
    "en-US": "Similar Document Search",
    en: "Similar Document Search"
  },
  PHRASAL_SEARCH: {
    "ko-KR": "구문 검색",
    ko: "구문 검색",
    "en-US": "Phrasal Search",
    en: "Phrasal Search"
  },
  QUERY_BAR_PLACEHOLDER: {
    "ko-KR": "검색하실 내용을 입력해주세요",
    ko: "검색하실 내용을 입력해주세요",
    "en-US": "Please input any query",
    en: "Please input any query"
  },
  // Query Result card
  RESULT_CARD_TITLE: {
    "ko-KR": "검색 결과",
    ko: "검색 결과",
    "en-US": "Search Results",
    en: "Search Results"
  },
  // Query History card
  QUERY_HISTORY_CARD_TITLE: {
    "ko-KR": "검색 히스토리",
    ko: "검색 히스토리",
    "en-US": "Query History",
    en: "Query History"
  },

  // Classification Card
  CLASSIFICATION_CARD_TITLE: {
    "ko-KR": "구분",
    ko: "구분",
    "en-US": "Classification",
    en: "Classification"
  },

  // Word Statistics Card
  WORD_STATISTICS_CARD_TITLE: {
    "ko-KR": "단어 통계",
    ko: "단어 통계",
    "en-US": "Word Statistics",
    en: "Word Statistics"
  },
  // Field
  FIELDS: {
    "ko-KR": "필드",
    ko: "필드",
    "en-US": "Fields",
    en: "Fields"
  },
  FIELD_NAME: {
    "ko-KR": "필드명",
    ko: "필드명",
    "en-US": "Field Name",
    en: "Field Name"
  },
  FIELD_VALUE: {
    "ko-KR": "필드값",
    ko: "필드값",
    "en-US": "Field Value",
    en: "Field Value"
  },
  // Annotation
  ANNOTATIONS: {
    "ko-KR": "어노테이션",
    ko: "어노테이션",
    "en-US": "Annotations",
    en: "Annotations"
  },
  // Word Cloud
  WORD_CLOUD: {
    "ko-KR": "워드클라우드",
    ko: "워드클라우드",
    "en-US": "Word Cloud",
    en: "Word Cloud"
  },
  // Word
  WORD: {
    "ko-KR": "워드",
    ko: "워드",
    "en-US": "Word",
    en: "Word"
  },
  // Count
  COUNT: {
    "ko-KR": "개수",
    ko: "개수",
    "en-US": "Count",
    en: "Count"
  },
  // Loading
  LOADING: {
    "ko-KR": "로딩중...",
    ko: "로딩중...",
    "en-US": "Loading...",
    en: "Loading..."
  }
};

const i18n = {};

const keys = Object.keys(STRINGS);
const keyCount = keys.length;
// default language is English
const languageCode = navigator.language || "en-US";
for (let i = 0; i < keyCount; i++) {
  i18n[keys[i]] = STRINGS[keys[i]][languageCode];
}

export { i18n };
