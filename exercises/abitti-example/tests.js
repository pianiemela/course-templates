"use strict";


Object.size = function (input_as_json) {
    var size = 0, key;
    for (key in input_as_json) {
        if (input_as_json.hasOwnProperty(key)) size++;
    }
    return size;
};

function replaceAll(str, find, replace) {
    if (str === undefined) return str;
    if (str === "") return str;
    return str.replace(new RegExp(find, 'g'), replace);
}

function testTeacherVsStudent(teacherInput, studentInput) {
    var l = Object.size(teacherInput);
    console.log("l=",l);
    if (l < 2) {
        try {
            console.log(teacherInput,studentInput);
            return teacherInput === studentInput;
        } catch (exp) {
            return false;
        }
    }

    try {
        var t1 = parseFloat(teacherInput[0]);
        var t2 = parseFloat(teacherInput[1]);
        return t1 < studentInput < t2;
    }
    catch (exp) {
        // return false;
    }

    try {
        var l_s = Object.size(studentInput);
        for (var i = 0; i < l; i++) {
            if (i<l_s)
                if (teacherInput[i] !== studentInput[i]) return false;
            else return false;
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
    var testsOk = 0;
    var success = true;
    var msg = "";
    for (var test of testFunctions) {
        msg += "Testing " + test.toString().split("\n")[0].split('{')[0] + ":";
        // console.error(msg);
        if (teacherInput.length > 1) {
            for (var key in teacherInput) {
                var t = teacherInput[key];
                if (key in studentInput) {
                    var s = studentInput[key];
                    try {
                        success = test(t, s);
                    } catch (exp) {
                        success = false;
                    }
                    if (success) {
                        msg = msg + " ok " + key + ": points: " + (++testsOk) + "\n";
                        // console.error(msg, " ok ", key, ": points: ", ++testsOk);
                    }
                    else msg = msg + "fail in " + key;
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
                msg = msg + " ok " +  studentInput + ": points: " + (++testsOk) + "\n";
                // console.error(msg, " ok ", key, ": points: ", ++testsOk);
            }
            else{ 
                msg = msg + "fail in " + studentInput.toString();
                for (var input in studentInput){
                    console.log(input);
                }

            }
            // else console.error(msg + "fail");
        }
    }
    // console.log(teacherInput,teacherInput.size);
    var l = 0;
    if (Object !== undefined) {
        try {
            l = Object.size(teacherInput);
        } catch (exp) { }
    }


    // taken the max of 10, we estimate total based on passed exercises
    var maxPoints = 10;
    var totalPossible = testFunctions.length * l;
    if (totalPossible == 0) totalPossible = maxPoints;
    var total = Math.round(testsOk / totalPossible * maxPoints);

    return {
        totalPoints: total,
        maxPoints: maxPoints,
        msg: msg
    };
}

function handleInput(contents, studentInput) {
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
            }
            studentInput[key] = val;
        }
    }

}


if (require.main === module) {

    // The input: tests.js "v" "expected_answer"

    // "v" - the name of the file, can be replaced with any other name as well
    // the instructions needed to setup the applet.
     // the user input conveyed to the script via run.sh $1 $2 $3 and then read here.
    // To keep the "expected" input as a one string it must be single-quoted.


    var fileName = "v"; //student input, defaults to "v"    
    try {
        fileName = process.argv[2];
    } catch (exp) { }
    console.log("filename: ",fileName);


    // the feedback 'v' comes as a file - even it was sent as a POST field
    var studentInput = {};
    var fs = require('fs');
    fs.readFile(fileName, 'utf8', function (err, contents) {
        console.error('answer ', contents, " checked");
        if (contents) handleInput(contents, studentInput);
    });

    var teacherInput = {};
    try {
        var input = replaceAll(process.argv[3], "'", "");
        teacherInput = JSON.parse(input);
    } catch (exp) { 
        console.error(exp.toString()+" "+input);
    }

    const result = testMain(teacherInput, studentInput);

    var res_msg = result.totalPoints + "/" + result.maxPoints;
    fs.writeFile("\feedback\points", res_msg, (err) => {
        if (err) console.log(err);
      });

    fs.writeFile("\feedback\output", result.msg+" "+res_msg, (err) => {
        if (err) console.log(err);
        // console.log("Successfully Written to File.");
      });

    // if (process.argv[2] === '-o') {
    //     console.log(result.msg);
    //     return result.msg;
    // }

    // var res_msg = result.totalPoints + "/" + result.maxPoints;
    // console.error(res_msg);
    // return res_msg;
}
