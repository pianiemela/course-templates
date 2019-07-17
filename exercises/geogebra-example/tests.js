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
    var msg="";
    Object.keys(studentInput).forEach(function (key) {
        var value = studentInput[key];
        msg = msg + key + "=" + value + ";";
    });
    msg = msg + "<br>";

    var points = 0;
    Object.keys(teacherInput).forEach(function (key) {
        var value = teacherInput[key];

        if (Array.isArray(value) ) {
            // if two numbers given, the value must locate in the range
            var studentValue = studentInput[key];
            if (studentValue) {
                try {
                    studentValue = parseFloat(studentValue);
                    if (parseFloat(value[0]) < studentValue < parseFloat(value[1])) {
                        points++;
                        msg += (studentValue + " OK<br>");
                    }
                }
                catch (exp) { console.log(exp); }
            }
        }
        else {
            try {
                var studentValue = studentInput[key];
		if (studentValue) studentValue=studentValue.toString().trim().replace(" ","");
                value = value.toString().trim();
                if (value === studentValue) {
                    points++;
                    msg = msg + key + " &#128077;<br>";   //thumbs-up
                }
                else {
                    msg = msg + key + " &#128078;<br>";  //thumbs-down
                }
            }
            catch (exp) { console.log(exp); }
        }
    });
    return {
        points:points, 
        msg:msg
    };
}


function getMap(str) {
    var studentInput={}
    if (str.length === 0) return {};
    var commands = str.split(";");
    for (var i = 0; i < commands.length; i++) {
        var command = commands[i];
        var parts = command.split(":");
        if (parts.length < 2) parts = command.split("=");
        var key = parts[0].trim();
        var value = "";
        if (parts.length > 1) {
            value = parts[1].trim();
        }
        if (key === "") continue;
        studentInput[key] = value;
    }
    return studentInput;
}


const testFunctions = [
    testTeacherVsStudent
];

function testMain(teacherInput, studentInput) {
    var points = 0;
    var max_points = 0;
    var msg = "";

    for (var test of testFunctions) {
        msg = msg + "Testing " + test.toString().split("\n")[0] + " ... <br>";
        max_points += Object.size(teacherInput);
        try {
            var res = test(teacherInput, studentInput);
            points = points + res.points;
            msg = msg + res.msg;
        } catch (exp) { console.log(exp); }
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
    } catch (exp) {console.log(exp);}

    // first parameter must be a file name, defaults to "v".
    // Yet multiple variables in the same page with the same name "v" 
    // mandates to name variables differently.
    // "v" is like "vastaus": a student input
    var fileName = "v"; //student input, defaults to "v"    
    try {
        fileName = process.argv[2];
    } catch (exp) { console.log(exp); }

    // read "v" or fileName
    var fs = require('fs');
    fs.readFile(fileName, 'utf8', function (err, contents) {
        var studentInput = getMap(contents);
        var result = testMain(teacherInput, studentInput);
        console.log(result.points+"/"+result.max_points+"<br>");
        console.log(result.msg+"<br>");
        console.error("TotalPoints: ", result.points);	    
        console.error("MaxPoints: ", result.max_points);
        console.error("filename: "+fileName);
        //console.error(teacherInput);
    if (result.points/result.max_points>0.5) console.error("Hienoa!");
    else if (result.points/result.max_points==0.5) console.error("Lähellä!");
    else console.error("Yritä vielä!");
        
    });
    return true;

}
