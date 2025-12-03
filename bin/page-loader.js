#!/usr/bin/env node

import { program } from "commander";
import { startApplication } from "../src/main.js";

program
  .version("1.0.0")
  .description("Page loader utility")
  .argument("<url>", "URL to download")
  .option("-o, --output [dir]", "output dir", process.cwd())
  .action((url, options) => {
    startApplication(url, options.output);
  });

program.parse();
