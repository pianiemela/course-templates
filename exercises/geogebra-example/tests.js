"use strict";



function isFunction(v,f) {
    //    return typeof hello === "function";
    return true;
}

function returnsString(v,f) {

    //    return typeof hello() === "string";
    return true;
}

function returnsHello(v,f) {
    //    return hello() === "Hello JavaScript!";
    return true;
}

// const testFunctions = [
//     isFunction,
//     returnsString,
//     returnsHello
// ];

const testFunctions = [
    isFunction,
    returnsString,
    returnsHello
];



function testMain(v,f) {
    let testsOk = 0;
    let success = true;
    for (let test of testFunctions) {
        let msg = "Testing " + test + " ... ";
        if (success) {
            success = test(v,f);
        }
        if (success) {
            testsOk++;
            console.error(msg + "ok");
        } else {
            console.error(msg + "fail");
        }
    }
    return {
        totalPoints: testsOk,
        maxPoints: testFunctions.length
    };
}

if (require.main === module) {


    /*
        for (let j = 0; j < process.argv.length; j++) {  
            console.log(j + ' -> ' + (process.argv[j]));
        }*/
    var v,f;
    var fs = require('fs');
    fs. readFile('v', 'utf8', function(err,  contents) {
        console.log(contents);
        var parts = contents.split(";");
        v = parts[0].split("=")[1];
        if (parts.length>1) {
            f=parts[1].split(":")[1];
        }
        console.log("v = ",v,", f = ",f);
    });
    //console.log('after calling readFile');

    //    console.log(ratkaisu);
    const result = testMain(v,f);
    console.log("TotalPoints: ", result.totalPoints);
    console.log("MaxPoints: ", result.maxPoints);
}
