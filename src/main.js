import Debug from "debug";
import { formatFilePath } from "./utils/formatter.js";
import { logger } from "./utils/logger.js";
import { getMainTasks } from "./tasks.js";

const debug = Debug("page-loader:main");

export const startApplication = (url, outputDir) => {
  debug("запуск приложения");
  debug("адрес: %s", url);
  debug("директория вывода: %s", outputDir);

  const htmlFileName = formatFilePath(url);
  debug("имя html файла: %s", htmlFileName);

  return getMainTasks()
    .run({ url, outputDir, htmlFileName })
    .then(() => {
      debug("Страница успешно загружена");
      logger.success(htmlFileName);
      return true;
    })
    .catch((error) => {
      logger.error(error.message);
      throw error;
    });
};
