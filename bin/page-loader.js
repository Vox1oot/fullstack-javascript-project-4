#!/usr/bin/env node

import { program } from "commander";
import { main } from "../src/main.js";

program
  .version("1.0.0")
  .description("Page loader utility")
  .argument("<url>")
  .option("-o --output [dir]", "output dir", process.cwd())
  .action((url, options) => {
    main(url);
    console.log(`Output: ${options.output}`);
  });

program.parse();
