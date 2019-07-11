"use strict";

Object.size = function (obj) {
    var size = 0;
    for (var key in obj) if (obj.hasOwnProperty(key)) size++;
    return size;
};

function replaceAll(str, find, replace) {
    if (str === undefined) return str;
    if (str === "") return str;
    return str.replace(new RegExp(find, 'g'), replace);
}

// the test function
// checks studentInput (got from Geogebra) against teacherInput (got from run.sh).
// teacherInput in JSON format, surrounded by single quotes - to keep it as one string
// studentInput as similar commands as inserted to GeoGebra, separator is ";"
// Each teacherInput grants one point if it matches - matching means str equivalence
function testTeacherVsStudent(teacherInput, studentInput) {
    var max_points = Object.size(teacherInput);
    var msg;
    Object.keys(studentInput).forEach(function (key) {
        var value = studentInput[key];
        msg = msg + key + "=" + value + ";";
    });
    msg = msg + "\n";

    var points = 0;
    Object.keys(teacherInput).forEach(function (key) {
        var value = teacherInput[key];
        console.log(value);
        if (value.length > 1) {
            // if two numbers given, the value must locate in the range
            var studentValue = studentInput[key];
            if (studentValue) {
                console.log("in test");
                try {
                    studentValue = parseFloat(studentValue);
                    console.log("in test", studentValue);
                    if (parseFloat(value[0]) < studentValue < parseFloat(value[1])) {
                        points++;
                        msg += (studentValue + " OK\n");
                    }
                }
                catch (exp) { console.log(exp); }
            }
        }
        else {
            value = value.toString();
            // console.log(key, value);
            if (key in studentInput) {
                var value_student = studentInput[key];
                // console.log(key, " in student ", value_student);
                if (value === value_student) {
                    points++;
                    msg = msg + key + " OK \n"
                }
            }
        }
    });
    console.log(points, max_points, msg);
    return [points, max_points, msg];
}


function getMap(str) {
    // console.log(str);
    var commands = str.split(";");
    var studentMap = {};
    for (var i = 0; i < commands.length; i++) {
        var command = commands[i];
        var parts = command.split(":");
        if (parts.length < 2) parts = command.split("=");
        var key = parts[0].trim();
        var value = "";
        if (parts.length > 1) {
            value = parts[1].trim();
        }
        console.log(key, value);
        studentMap[key] = value;
    }

    return studentMap;
}


const testFunctions = [
    testTeacherVsStudent
];

function testMain(teacherInput, studentInput) {
    // var testsOk = 0;
    var points = 0;
    var max_points = 0;
    var success = true;
    var msg = "";

    for (var test in testFunctions) {
        msg = msg + "Testing " + test.toString().split("\n")[0] + " ... \n";
        try {
            var res = test(t, s);
            points += res[0];
            max_points += res[1];
            msg = msg + res[2];
        } catch (exp) { }
    }

    return {
        points: points,
        max_points: max_points,
        msg: msg
    };
}

if (require.main === module) {

    var teacherInput = {};
    try {
        // single quotes removed 
        var input = replaceAll(process.argv[3], "'", "");
        teacherInput = JSON.parse(input);
    } catch (exp) { }

    // first parameter must be a file name, defaults to "v".
    // Yet multiple variables in the same page with the same name "v" 
    // mandates to name variables differently.
    // "v" is like "vastaus": a student input
    var fileName = "v"; //student input, defaults to "v"    
    try {
        fileName = process.argv[2];
    } catch (exp) { }
    console.log("filename: ", fileName);

    // read "v"
    var studentInput = {};
    var fs = require('fs');
    fs.readFile(fileName, 'utf8', function (err, contents) {
        if (contents) studentInput = getMap(contents);
    });


    const result = testMain(teacherInput, studentInput);
    var res_points = result.points + "/" + result.max_points;
    fs.writeFile("\feedback\points", res_points, (err) => { if (err) console.log(err); });
    fs.writeFile("\feedback\output", result.msg+"\n Tulos: "+res_points, (err) => { if (err) console.log(err); });
    return result.totalPoints + "/" + result.maxPoints;
}
