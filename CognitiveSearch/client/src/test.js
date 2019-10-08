let currentQuery = 'annotation.unstructure.tech:"클라우드" AND annotation.unstructure.tech:"빅데이터"';
let deleteQuery = 'annotation.unstructure.tech:"클라우드"';

let strLength = deleteQuery.length;
console.log('strLen : ' + strLength);
let startPoint = currentQuery.indexOf(deleteQuery);
console.log('startPoint : ' + startPoint);
let final;
//처음
if(startPoint === 0){
    final = currentQuery.substr(strLength+5, currentQuery.length);    //' AND '
}
//마지막
else if(startPoint + strLength === currentQuery.length){
    final = currentQuery.substr(0, startPoint-5);
}
//중간
else{
    final = currentQuery.substr(0, startPoint-5) + currentQuery.substr(startPoint+strLength, currentQuery.length);
}
console.log(final);