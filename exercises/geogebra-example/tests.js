"use strict";


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function testTeacherVsStudent(teacherInput, studentInput) {
    var l = Object.size(teacherInput);
    if (l < 2) {
        return teacherInput === studentInput;
    }
    if (typeof (teacherInput) === "number")
        return teacherInput[0] < studentInput < teacherInput[1];
}

const testFunctions = [
    testTeacherVsStudent
];

function testMain(teacherInput, studentInput) {
    // console.log("in testMain");
    let testsOk = 0;
    let success = true;
    for (let test of testFunctions) {
        let msg = "Testing " + test + " ... ";
        // console.log(msg);
        // for (const [key, t] of teacherInput.entries()) {

        for (var key in teacherInput) {
            var t = teacherInput[key];
            // console.log(key, t, studentInput, (key in studentInput));

            if (key in studentInput) {
                var s = studentInput[key];
                // console.log(t, s);
                success = test(t, s);
                success ? console.error(msg, " ok ", key, ": points: ", testsOk++) : console.error(msg + "fail");
            }
        }
    }
    // console.log(teacherInput,teacherInput.size);
    var l = Object.size(teacherInput);
    var maxPoints = testFunctions.length * l;
    return {
        totalPoints: testsOk,
        maxPoints: maxPoints
    };
}

if (require.main === module) {

    var teacherInput = {};
    var studentInput = {};
    var obj = JSON.parse(process.argv[2]);
    // console.log(obj);

    for (var par in obj) {
        var val = obj[par];
        // console.log("teacher", par,val);
        teacherInput[par] = val;
    }

    var fs = require('fs');
    fs.readFile('v', 'utf8', function (err, contents) {
        // console.log(contents);
        if (contents) {
            var parts = contents.split(",");
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var par = part.split("=")[0].trim();
                var val = part.split("=")[1].trim();
                try {
                    val = parseInt(val);
                }
                catch (e) { }
                try {
                    val = parseFloat(val);
                }
                catch (e2) { }

                // console.log("student", par, val);
                // studentInput.set(par, val);
                studentInput[par] = val;
            }
        }
    });

    // TODO: remove this
    // studentInput.set("a", 1);
    studentInput["a"] = 1;

    const result = testMain(teacherInput, studentInput);
    // console.log("TotalPoints: ", result.totalPoints);
    // console.log("MaxPoints: ", result.maxPoints);
    return true;
}
