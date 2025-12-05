import { formatFilePath } from "./utils/formatter.js";
import { load } from "./utils/loader.js";
import { write } from "./utils/writer.js";
import { logger } from "./utils/logger.js";

export const startApplication = (url, outputDir) => {
  const fileName = formatFilePath(url);

  load(url)
    .then((data) => write(outputDir, fileName, data))
    .then((pathName) => logger.success(pathName))
    .catch((error) => {
      logger.error(error.message);
      process.exit(1);
    });
};
