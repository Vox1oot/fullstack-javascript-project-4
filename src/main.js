import { formatFilePath } from "./utils/formatter.js";
import { load } from "./utils/loader.js";
import { writeFile } from "./utils/writeFile.js";
import { logger } from "./utils/logger.js";

export const startApplication = (url, outputDir) => {
  const fileName = formatFilePath(url);

  load(url)
    .then((data) => writeFile(outputDir, fileName, data))
    .then((pathName) => logger.success(pathName))
    .catch((error) => {
      logger.error(error.message);
      process.exit(1);
    });
};

// startApplication("https://ru.hexlet.io/pages/about", "./download");
