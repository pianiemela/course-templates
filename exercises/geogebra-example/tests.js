"use strict";


Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function replaceAll(str, find, replace) {
    if (str===undefined) return str;
    if (str==="") return str;
    return str.replace(new RegExp(find, 'g'), replace);
}

function testTeacherVsStudent(teacherInput, studentInput) {
    var l = Object.size(teacherInput);
    if (l < 2) {
        try {
            return teacherInput === studentInput;
        } catch (exp) {
            return false;
        }
    }

    try {
        t1 = parseFloat(teacherInput[0]);
        t2 = parseFloat(teacherInput[1]);
        return t1 < studentInput < t2;
    }
    catch (exp) {
        // return false;
    }

    try {
        for (var i = 0; i < l; i++) {
            if (teacherInput[i] !== studentInput[i]) return false;
        }
        return true;
    }
    catch (exp) {
        return false;
    }
}

const testFunctions = [
    testTeacherVsStudent
];

function testMain(teacherInput, studentInput) {
    let testsOk = 0;
    let success = true;
    for (let test of testFunctions) {
        let msg = "Testing " + test.toString().split("\n")[0] + " ... ";
        // console.error(msg);
        if (teacherInput.length > 1) {
            for (var key in teacherInput) {
                var t = teacherInput[key];
                // console.log(key, t, studentInput, (key in studentInput));

                if (key in studentInput) {
                    var s = studentInput[key];
                    // console.log(t, s);
                    try {
                        success = test(t, s);
                    } catch (exp) {
                        success = false;
                    }
                    if (success) {
                        ++testsOk;
                        // console.error(msg, " ok ", key, ": points: ", ++testsOk);
                    }
                    // else console.error(msg + "fail");
                }
            }
        }
        else {
            try {
                success = test(teacherInput, studentInput);
            } catch (exp) {
                success = false;
            }
            if (success) {
                ++testsOk;
                // console.error(msg, " ok ", key, ": points: ", ++testsOk);
            }
            // else console.error(msg + "fail");
        }
    }
    // console.log(teacherInput,teacherInput.size);
    var l = 0;
    if (Object!==undefined){
        try{
            l = Object.size(teacherInput);
        }catch(exp){}
    }

  
    // taken the max of 10, we estimate total based on passed exercises
    var maxPoints = 10;
    var totalPossible = testFunctions.length * l;
    if (totalPossible==0) totalPossible = maxPoints;  
    var total = Math.round(testsOk / totalPossible * maxPoints);

    return {
        totalPoints: total,
        maxPoints: maxPoints
    };
}

if (require.main === module) {

    var teacherInput = {};
    var studentInput = {};
    var input = replaceAll(process.argv[2], "'", "");
    var obj;
    try{
        obj = JSON.parse(input);
    }catch(exp){}

    for (var par in obj) {
        var val = obj[par];
        // console.log("teacher", par,val);
        teacherInput[par] = val;
    }

    var fs = require('fs');
    fs.readFile('v', 'utf8', function (err, contents) {
        // console.log(contents);
        // console.error('answer ', contents, " checked");
        if (contents) {
            var parts = contents.split(";");
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].trim();
                if (part.length < 2) break;

                var assigns = part.split("=");
                if (assigns.length < 2) {
                    assigns = part.split(":");
                }
                if (assigns.length > 1) {
                    var key = assigns[0].trim();
                    var val = assigns[1].trim();
                    try {
                        val = parseInt(val);
                    }
                    catch (e) {
                        if (typeof (val) !== "number") {
                            try {
                                val = parseFloat(val);
                            }
                            catch (e2) { }
                        }

                        // console.log("student", par, val);
                        // studentInput.set(par, val);
                    }
                    studentInput[key] = val;
                }
            }
        }
    });

    // studentInput["a"] = [1,2];
    // studentInput["b"] = 2;

    const result = testMain(teacherInput, studentInput);
    // console.error("TotalPoints: ", result.totalPoints);
    // console.error("MaxPoints: ", result.maxPoints);
    console.error(result.totalPoints + "/" + result.maxPoints);

    return result.totalPoints + "/" + result.maxPoints;
}
