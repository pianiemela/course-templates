"use strict";


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function testTeacherVsStudent(teacherInput, studentInput) {
    var l = Object.size(teacherInput);
    if (l < 2) {
        try{
            return teacherInput === studentInput;
        }catch(exp){
            return false;
        }
    }

    try {
        t1 = parseFloat(teacherInput[0]);
        t2 = parseFloat(teacherInput[1]);
        return t1 < studentInput < t2;
    }
    catch (exp) { }

    for (var i = 0; i < l; i++) {
        if (teacherInput[i] !== studentInput[i]) return false;
    }
    return true;
}

const testFunctions = [
    testTeacherVsStudent
];

function testMain(teacherInput, studentInput) {
    let testsOk = 0;
    let success = true;
    for (let test of testFunctions) {
        let msg = "Testing " + test.toString().split("\n")[0] + " ... ";
        console.error(msg);
        for (var key in teacherInput) {
            var t = teacherInput[key];
            // console.log(key, t, studentInput, (key in studentInput));

            if (key in studentInput) {
                var s = studentInput[key];
                // console.log(t, s);
                success = test(t, s);
                success ? console.error(msg, " ok ", key, ": points: ", ++testsOk) : console.error(msg + "fail");
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
    var input = replaceAll(process.argv[2], "'", "");
    var obj = JSON.parse(input);

    for (var par in obj) {
        var val = obj[par];
        // console.log("teacher", par,val);
        teacherInput[par] = val;
    }

    var fs = require('fs');
    fs.readFile('v', 'utf8', function (err, contents) {
        // console.log(contents);
        console.error('answer ',contents, " checked");
        if (contents) {
            var parts = contents.split(",");
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].trim();
                if (part.length<2) break;
                var key = part.split("=")[0].trim();
                var val = part.split("=")[1].trim();
                try {
                    val = parseInt(val);
                }
                catch (e) { }
                if (typeof (val) !== "number") {
                    try {
                        val = parseFloat(val);
                    }
                    catch (e2) { }
                }

                // console.log("student", par, val);
                // studentInput.set(par, val);
                studentInput[key] = val;
            }
        }
    });

    // studentInput["a"] = [1,2];
    // studentInput["b"] = 2;

    const result = testMain(teacherInput, studentInput);
    console.error("TotalPoints: ", result.totalPoints);
    console.error("MaxPoints: ", result.maxPoints);
    return true;
}
