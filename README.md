<h2>Application Flow</h2>
<h3>Redux Flow </br></h3>
 client/src/index.js : App.js 호출 및 Store에 App 등록(action, reducer가 App.js로 전달된다)
 client/src/configureStore.js : Stroe 생성
 client/src/App.js : App 구현부로 state초기값으로 화면을 render한다.
 client/src/reducer/index.js
 client/src/action/index.js

<h3>App working Flow</h3>
<b>1. 최초 화면 띄우면서 collection 정보를 불러온다.</b>
- src/index.js : store를 생성한 뒤에 App.js을 호출한다.
- App.js가 호출되면서 기본 render()를 하고 그후에 componentDidMount가 실행되면서 fetchCollections()를 호출한다.
- store는 index>configureStore>reducer>action 순으로 import되어 만들어지는데
- 최하위 action에서는 액션변수를 정의해서 reducer로 넘기고 아까 호출된 액션함수 "fetchCollections"는 App.js로 넘긴다.
- 실행함수 "fetchCollections"는 action/index.js에 정의되어있는데 3개의 액션함수를 가지고 있고 각각의 액션을 수행(dispatch)한다.
- 순차적인 dispatch에 의해 3개 action 객체들이 reducer의 실행로직 "collections()으로 순차적으로 전달된다"(중요)
- 순차적으로 들어온 action들이 각각의 로직이 수행된다(setCurrentCollection, setCollections, requestCollections) 
- 다시 App.js로 돌아와서 "fetchCollections" 호출 후 컬렉션들을 가져온다음 this.setState({isApplicationLoading : false})로 바뀌면서 최초 로딩될때 끄느 spining로딩 아이콘이 꺼지게된다.
</br>
<b>2. 원하는 콜렉션을 선택하고 쿼리를 날린다.</b>
-쿼리 버튼은 최 말단 컴포넌트인 /component/QueryBar.js의 <Button onClick={onSearch}>에서 발생하며 상위 컴포넌트인 App.js에서 import하고있다.
-App.js에서 <QueryBar onSerach={this.handleSearch}>에서 props로 handelSearch를 QueryBar로 전달한다.
-즉 사용자가 버튼클릭하면 onSearch가 handleSearch를 호출한다.
-handleSearch()는 this.handleSendQuery(this.state.query)를 호출하고
-handleSendQuery()는 "fetchAnalysisData(query)"를 호출한다.
-fetchAnalysisData는 쿼리모드에 따라 fetchClassifierResult, fetchSimilarDocumentQueryResult를 호출하고
-fetchClassifierResult, fetchSimilarDocumentQueryResult 메소드는 /lib/service.js에 작성되있고 이걸 App.js에서 import해서 쓰고있다.
-즉 호출된 fetch 함수를 /lib/service.js에서 보면 axios로 onewex API를 호출하는 역할을 한다. 
-그럼 server의 api router에서 miner의 api를 까서 request를 보내고 결과를 docs라는 key에 맵핑해서 App.js 아래의 fetchFunc로 최종 결과를 받아오고 setState로 re-rander를 한다.

<h3>Word-cloud function Flow</h3>
src/App.js : 기본적으로 ResultCard를 그린다. render( <ResulrCard renderRow(queryMode)>)
src/App.js : renderRow()가 queryMode에 따라서 <WordCloudRow> 혹은 <BasicRow>를 가져오면서 data를 넘긴다.
WordCloudRow.js : <BasicRow>를 가져온다음 <WordCloud>를 가져온다. (참고로 <BasicRow>는 antd의 <List>를 가져와서 doc본문을 그리는 역할을 한다)
WordCloud.js : data를 받아와서 실제로 D3를 그린다. 데이터는 쿼리검색 버튼 눌렀을때 App.js의 fetchAnalysisData가 호출되면서 이미 브라우저로 가져온상태이다.

<h2>How to run this app</h2>
1. client/npm install, server/api/npm install, server/web/npm install

2. client/에 .env 파일을 생성해준다.
//파일명 : .env
//파일내용 : REACT_APP_KA_API_URL=http://khwex-sd-host.fyre.ibm.com:8100
//파일설명 : production 환경에서 port를 8100으로 지정했고 실제로 배포했을때 8100 port와 해당 주소를 가지고 API_URL로 쓰겠다는 뜻이다. 이건 gitignore에서 제외되기때문에 드라이브에 따로 보관한다.

3. client/npm run build를 한다.
//코드설명 : client단의 소스를 배포가능한 단위로 만들어서 server side에서 돌리게 해준다.
mkdir /server/web/client
cp client/build/* ../../server/web/client
//코드설명 : 빌드된 client side가 서버쪽 client로 오게된다. 그래야 client에서 server쪽 호출이 가능하다.

4. server/api/config.json을 생성한다.
{
  "rootUri" : "https://localhost",
  "username" : "admin",
  "password" : "admin",
  "collectionId" : "3dbf7d7d-b9d2-1180-0000-01673ef5187c"
}
//코드설명 : docker port 443은 htts의 기본 포트이므로 생략하며 http가 아닌 https를 써야 onewex api docs에 접근할 수 있다.

5. ./server/pm2 start ecosystem.config.js --env production
로 실행한다.
