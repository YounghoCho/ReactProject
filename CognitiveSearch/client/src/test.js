let str = 'annotation.tech.ai:"딥러닝" AND annotation.tech:"인공지능" AND annotation.industry:"자동차 산업"';
let temp = 'annotation.tech:"인공지능"';

let strLength = temp.length;
console.log('strLen : ' + strLength);
let startPoint = str.indexOf(temp);
console.log('startPoint : ' + startPoint);
let final;
//처음
if(startPoint === 0){
    final = str.substr(strLength+5, str.length);    //' AND '
}
//마지막
else if(startPoint + strLength === str.length){
    final = str.substr(0, startPoint-5);
}
//중간
else{
    final = str.substr(0, startPoint-5) + str.substr(startPoint+strLength, str.length);
}
console.log(final);