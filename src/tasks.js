import Listr from "listr";
import Debug from "debug";
import { loader } from "./services/loader.service.js";
import { HtmlParserService } from "./services/html-parser.service.js";
import { ResourceProcessorService } from "./services/resource-processor.service.js";
import { writeFile } from "./utils/writeFile.js";

const debug = Debug("page-loader:tasks");
const isDebugEnabled = process.env.DEBUG;

const RESOURCE_TASKS = [
  {
    title: "Загрузка изображений",
    type: "images",
  },
  {
    title: "Загрузка скриптов",
    type: "scripts",
  },
  {
    title: "Загрузка ссылок",
    type: "links",
  },
];

export const getMainTasks = () => {
  let htmlParser;
  let resourceProcessor;

  return new Listr(
    [
      {
        title: `Загрузка HTML страницы`,
        task: (ctx) => {
          debug("загружаем html страницу: %s", ctx.url);
          return loader.load(ctx.url).then((data) => {
            htmlParser = new HtmlParserService(data);
            resourceProcessor = new ResourceProcessorService(
              ctx.url,
              ctx.outputDir,
              htmlParser
            );
          });
        },
      },
      {
        title: "Загрузка ресурсов",
        task: () => {
          debug("обрабатываем ресурсы: изображения, скрипты, ссылки");
          return new Listr(
            RESOURCE_TASKS.map(({ title, type }) => ({
              title,
              task: () => resourceProcessor.processResources(type),
            })),
            { concurrent: true }
          );
        },
      },
      {
        title: `Сохранение html файла`,
        task: (ctx) => {
          debug("записываем html файл: %s", ctx.htmlFileName);
          const updatedHtml = htmlParser.getHtml();
          return writeFile(ctx.outputDir, ctx.htmlFileName, updatedHtml);
        },
      },
    ],
    {
      renderer: isDebugEnabled ? "verbose" : "default",
    }
  );
};
