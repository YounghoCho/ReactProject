let test1 = () => {
    func(1);
}
let test2 = () => {
    func(2);
}


let func = (n) => {
    console.log("test" + n);
}
test1();
test2();