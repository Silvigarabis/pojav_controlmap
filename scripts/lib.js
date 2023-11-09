#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as jsYaml from "js-yaml";

export function fromJsonToYaml(inputDir, outputDir){
    const files = searchFile2(inputDir, (f) => f.endsWith(".json"));
    
    if (!fs.statSync(inputDir).isDirectory())
        inputDir = path.dirname(inputDir);
        
    for (const f of files){
        let newFile = path.join(outputDir, path.relative(inputDir, setPrefix(f, "yml")));
        console.log(`${f} -> ${newFile}`);
        let data = readJsonFile(f);
        writeYamlFile(newFile, data);
    }
}

export function fromYamlToJson(inputDir, outputDir){
    const files = searchFile2(inputDir, (f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    
    if (!fs.statSync(inputDir).isDirectory())
        inputDir = path.dirname(inputDir);
        
    for (const f of files){
        let newFile = path.join(outputDir, path.relative(inputDir, setPrefix(f, "json")));
        console.log(`${f} -> ${newFile}`);
        let data = readYamlFile(f);
        writeJsonFile(newFile, data);
    }
}

function searchFile(searchPath, filter){
    const inputs = [searchPath];
    const matches = [];
    while (inputs.length > 0){
        const file = inputs.pop();
        if (!fs.statSync(file).isDirectory()){
            if (filter(file)){
                matches.push(file);
            }
        } else {
            const files = fs.readdirSync(file).map(fname => path.join(file, fname));
            inputs.push(...files);
        }
    }
    return matches;
}

function searchFile2(searchPath, filter){
    const inputs = [searchPath];
    const matches = [];
    while (inputs.length > 0){
        const file = inputs.pop();
        if (!fs.statSync(file).isDirectory()){
            if (test(file))
                matches.push(file);
        } else {
            let dir = file;
            for (const fname of fs.readdirSync(dir)){
                const file = path.join(dir, fname);
                const stat = fs.statSync(file);
                if (!stat.isDirectory()){
                    if (test(file))
                        matches.push(file);
                } else {
                    inputs.push(file);
                }
            }
        }
    }
    function test(file){
        return !filter || filter(file);
    }
    return matches;
}

function setPrefix(file, prefix){
    let fileName = path.basename(file);
    let fileDir = path.dirname(file);
    let cutIdx = fileName.lastIndexOf(".");
    if (cutIdx === -1)
        cutIdx = fileName.length;
    let name = fileName.slice(0, cutIdx) + "." + prefix;
    return path.join(fileDir, name);
}

function readFile(file){
    return fs.readFileSync(file, "utf8");
}
function writeFile(file, data){
    if (data == undefined)
        data = "";
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let needWrite = true;
    try {
        let oldData = readFile(file);
        needWrite = oldData !== data;
    } catch {
        // nothing
    }
    if (needWrite)
        fs.writeFileSync(file, data, { flag: 'w+' });
}

export function readJsonFile(file){
    let json = readFile(file);
    json = json.replace(/(?:\/\*[\s\S]*?\*\/|\/\/.*$)/gm, (comment) => {
        const spaces = new Array(comment.length);
        spaces.fill(" ");
        return spaces.join("");
    });
    
    let data;
    try {
        data = JSON.parse(json);
    } catch(e){
        quit(`读取时出现错误: ${e.message}`);
   }
    return data;
}

export function writeJsonFile(file, data){
    let json = JSON.stringify(data, 4);
    writeFile(file, json);
}

export function readYamlFile(file){
    let yaml = readFile(file);
    let data;
    try {
        data = jsYaml.load(yaml);
    } catch(e){
        const reason = e.reason;
        const { snippet, column, position, line } = e.mark;
        quit(`读取时出现错误: line ${line}, column ${column}\n${reason}\n${snippet}`);
   }
    return data;
}

export function writeYamlFile(file, data){
    let yaml = jsYaml.dump(data);
    writeFile(file, yaml);
}

function exit(...data){
    if (data.length > 0)
        console.log(...data);
    process.exit(0);
    throw new Error("stopped by exit");
}

function quit(...data){
    if (data.length > 0)
        console.log(...data);
    process.exit(1);
    throw new Error("stopped by quit");
}

