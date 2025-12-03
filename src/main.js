import { formatter } from "./utils/formatter.js";
import { load } from "./utils/loader.js";
import { logger } from "./utils/logger.js";

export const startApplication = (url, outputDir) => {
  const fileName = formatter(url);

  load(url, outputDir, fileName)
    .then((pathName) => logger.success(pathName))
    .catch((error) => logger.error(error.message));
};
