let arr = [30, 70, 20];

for(let i=0; i<2; i++){
    for(let j=0; j<2; j++){
        if(arr[j] < arr[j+1]){
            console.log("yes");
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
}

console.log(arr);