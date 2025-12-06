import { formatFilePath, formatDirPath } from "./utils/formatter.js";
import { HtmlParserService } from "./services/html-parser.service.js";
import { loader } from "./services/loader.service.js";
import { writeFile } from "./utils/writeFile.js";
import { logger } from "./utils/logger.js";
import { buildResourceUrl } from "./utils/buildResourceUrl.js";
import path from "path";

export const startApplication = (url, outputDir) => {
  const htmlFileName = formatFilePath(url);
  const resourceDirName = path.resolve(outputDir, formatDirPath(url));

  loader
    .load(url)
    .then((data) => {
      const htmlParser = new HtmlParserService(data);

      const imagePaths = htmlParser.getImageSources();
      const imageResources = imagePaths.reduce(
        (acc, imagePath) => {
          const resourceUrl = buildResourceUrl(url, imagePath);
          acc.resourceUrls.push(resourceUrl);
          acc.formattedFileNames.push(formatFilePath(resourceUrl));
          return acc;
        },
        {
          resourceUrls: [],
          formattedFileNames: [],
        }
      );

      const images = loader.loadResources(imageResources.resourceUrls);

      images.then((data) => {
        data.forEach((imageData, index) => {
          const formattedFileName = imageResources.formattedFileNames[index];

          writeFile(resourceDirName, formattedFileName, imageData);

          const originalPath = imagePaths[index];
          htmlParser.replaceImgBySrc(
            originalPath,
            path.join(formatDirPath(url), formattedFileName)
          );
        });

        const updatedHtml = htmlParser.getHtml();

        writeFile(outputDir, htmlFileName, updatedHtml).then((pathName) =>
          logger.success(pathName)
        );
      });
    })
    .catch((error) => {
      logger.error(error.message);
      process.exit(1);
    });
};
