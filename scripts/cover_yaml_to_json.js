#!/usr/bin/env node

import { fromYamlToJson } from "./lib.js";

fromYamlToJson(process.argv[2], process.argv[3]);
