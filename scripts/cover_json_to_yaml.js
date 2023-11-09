#!/usr/bin/env node

import { fromJsonToYaml } from "./lib.js";

fromJsonToYaml(process.argv[2], process.argv[3]);
