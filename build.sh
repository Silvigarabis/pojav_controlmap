#!/bin/bash

set -xe

cp -r src/* dist/

# build sil keymap

output=dist/sil_v3.2.yml

files=($(cat sil.txt))
for ((i=0; i< ${#files[*]}; i++)); do
    files[$i]=src/sil/${files[$i]}
done

echo node scripts/merge.js "$output" ${files[@]}
node scripts/merge.js "$output" ${files[@]}

node scripts/cover_yaml_to_json.js dist controlmap

cp -r controlmap/* ../controlmap/

for f in src/toYaml/*.json; do
    name=${f%.*}
    if ! [ -f "$f" ]; then
        continue
    fi
    if ! [ -f ${name}.yml -o -f ${name}.yaml ]; then
        node scripts/cover_json_to_yaml.js ${f} src/toYaml/
    fi
done
