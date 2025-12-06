import { formatFilePath } from "./utils/formatter.js";
import { HtmlParserService } from "./services/html-parser.service.js";
import { ResourceProcessorService } from "./services/resource-processor.service.js";
import { loader } from "./services/loader.service.js";
import { writeFile } from "./utils/writeFile.js";
import { logger } from "./utils/logger.js";

export const startApplication = (url, outputDir) => {
  const htmlFileName = formatFilePath(url);

  loader
    .load(url)
    .then((data) => {
      const htmlParser = new HtmlParserService(data);
      const resourceProcessor = new ResourceProcessorService(
        url,
        outputDir,
        htmlParser
      );

      return resourceProcessor
        .processResources("images")
        .then(() => htmlParser.getHtml());
    })
    .then((updatedHtml) => {
      return writeFile(outputDir, htmlFileName, updatedHtml);
    })
    .then((pathName) => {
      logger.success(pathName);
    })
    .catch((error) => {
      logger.error(error.message);
      process.exit(1);
    });
};
