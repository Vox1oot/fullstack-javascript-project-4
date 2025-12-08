import Debug from "debug";
import { formatFilePath } from "./utils/formatter.js";
import { HtmlParserService } from "./services/html-parser.service.js";
import { ResourceProcessorService } from "./services/resource-processor.service.js";
import { loader } from "./services/loader.service.js";
import { writeFile } from "./utils/writeFile.js";
import { logger } from "./utils/logger.js";

const debug = Debug("page-loader:main");

export const startApplication = (url, outputDir) => {
  debug("запуск приложения");
  debug("адрес: %s", url);
  debug("директория вывода: %s", outputDir);

  const htmlFileName = formatFilePath(url);
  debug("имя html файла: %s", htmlFileName);

  loader
    .load(url)
    .then((data) => {
      debug("html загружен, размер: %d байт", data.length);
      const htmlParser = new HtmlParserService(data);
      const resourceProcessor = new ResourceProcessorService(
        url,
        outputDir,
        htmlParser
      );

      debug("обрабатываем ресурсы: изображения, скрипты, ссылки");
      return Promise.all([
        resourceProcessor.processResources("images"),
        resourceProcessor.processResources("scripts"),
        resourceProcessor.processResources("links"),
      ]).then(() => {
        debug("все ресурсы обработаны, получаем обновленный html");
        return htmlParser.getHtml();
      });
    })
    .then((updatedHtml) => {
      debug("записываем html файл: %s", htmlFileName);
      return writeFile(outputDir, htmlFileName, updatedHtml);
    })
    .then((pathName) => {
      debug("страница успешно загружена в: %s", pathName);
      logger.success(pathName);
    })
    .catch((error) => {
      debug("произошла ошибка: %s", error.message);
      logger.error(error.message);
      process.exit(1);
    });
};
