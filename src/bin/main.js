#!/usr/bin/env node

import { program } from "commander";

program
  .version("1.0.0")
  .description("Page loader utility")
  .argument("<url>")
  .option("-o --output [dir]", "output dir", process.cwd())
  .action((url, options) => {
    console.log(`URL: ${url}`);
    console.log(`Output: ${options.output}`);
  });

program.parse();
