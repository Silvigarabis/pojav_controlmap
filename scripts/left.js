#!/usr/bin/env node

import { writeYamlFile, readYamlFile } from "./lib.js";
import * as fs from "node:fs";

const input = process.argv[2];
const output = process.argv[3];

let hasError = false;

if (input == null){
    hasError = 1;
    console.error("no input file");
    console.log("usage: left <input file> <output file>");
} else if (output == null){
    hasError = 1;
    console.error("no output file");
    console.log("usage: left <input file> <output file>");
} else if (fs.existsSync(output)
       && !fs.statSync(output).isFile()){
    
    hasError = 1;
    console.error("output file", "'" + output + "'", "existing and not a normal file");
}

if (hasError)
    process.exit(hasError);
else
    main();

function left(button){
    let origin = button.dynamicX;
    button.dynamicX = `\${right} - (${origin})`;
}

function main(){
    const data = readYamlFile(input);
    let { 
        mControlDataList,
        mDrawerDataList,
        mJoystickDataList
    } = data;
    mControlDataList = mControlDataList ?? [];
    mJoystickDataList = mJoystickDataList ?? [];
    mDrawerDataList = mDrawerDataList ?? [];
    
    let buttons = [];
    buttons.push(...mControlDataList);
    for (const drawerButtons of mDrawerDataList){
        buttons.push(drawerButtons.properties);
        buttons.push(...drawerButtons.buttonProperties);
    }
    console.log(`found ${buttons.length} buttons`);
    for (let button of buttons){
        left(button);
    }
    console.log("completed!");
    
    console.log("writing data to:", output);
    writeYamlFile(output, data);
}
