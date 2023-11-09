#!/usr/bin/env node

import { writeYamlFile, readYamlFile } from "./lib.js";
import * as fs from "node:fs";

const output = process.argv[2];
const inputs = process.argv.length > 3
   ? process.argv.slice(3, process.argv.length)
   : [];

let hasError = false;

for (const f of inputs){
    if (!fs.existsSync(f)){
        hasError = 1;
        console.error("file didn't exist:", f);
        continue;
    }
    
    if (fs.statSync(f).isFile()){
        continue;
    }
    
    hasError = 1;
    
    console.error("not a file:", f);
}

if (output == null){
    hasError = 1;
    console.error("no output file");
    console.log("usage: merge <outfile> ...<input file(s)>");
} else if (fs.existsSync(output)
       && !fs.statSync(output).isFile()){
    
    hasError = 1;
    console.error("output file", "'" + output + "'", "existing and not a normal file");
} else if (inputs.length === 0){
    hasError = 1;
    console.error("no input file(s) specific");
}

if (hasError)
    process.exit(hasError);
else
    main();

function main(){
    let mControlDataList = [];
    let mJoystickDataList = [];
    let mDrawerDataList = [];
    const data = {
        mControlDataList,
        mDrawerDataList,
        mJoystickDataList,
        scaledAt: 100,
        version: 6
    };
    
    for (const inputFile of inputs){
        console.log("reading", inputFile);
        
        const data0 = readYamlFile(inputFile);
        if (Array.isArray(data0.mControlDataList)){
            console.log("+ mControlDataList:", data0.mControlDataList.length);
            mControlDataList.push(...data0.mControlDataList);
        }
        if (Array.isArray(data0.mDrawerDataList)){
            console.log("+ mDrawerDataList:", data0.mDrawerDataList.length);
            mDrawerDataList.push(...data0.mDrawerDataList);
        }
        if (Array.isArray(data0.mJoystickDataList)){
            console.log("+ mJoystickDataList:", data0.mJoystickDataList.length);
            mJoystickDataList.push(...data0.mJoystickDataList);
        }
    }
    console.log("====================================");
    console.log("mJoystickDataList:", mJoystickDataList.length);
    console.log("mDrawerDataList:", mDrawerDataList.length);
    console.log("mControlDataList:", mControlDataList.length);
    console.log("====================================");
    
    console.log("writing data to:", output);
    writeYamlFile(output, data);
}
