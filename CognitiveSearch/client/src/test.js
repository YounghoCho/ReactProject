let str = "머신러닝 OR ";

console.log(str.substr(str.length-3, str.length));
if(str.substr(str.length-3, str.length).trim() === "OR"){
    console.log("1");
}else{
    console.log("2");
}