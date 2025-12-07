import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { HtmlParserService } from "../src/services/html-parser.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, "..", "__fixtures__", "html-parser", filename);

const readFixture = (filename) =>
  fs.readFile(getFixturePath(filename), "utf-8");

describe("HtmlParserService", () => {
  describe("getImageSources", () => {
    it("должен извлекать src изображений", async () => {
      const html = await readFixture("images-multiple.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getImageSources();

      expect(sources).toEqual([
        "/assets/image1.png",
        "https://example.com/image2.jpg",
        "/images/logo.svg",
      ]);
    });

    it("должен игнорировать изображения с data URI", async () => {
      const html = await readFixture("images-with-data-uri.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getImageSources();

      expect(sources).toEqual(["/assets/image.png"]);
    });

    it("должен возвращать пустой массив если нет изображений", async () => {
      const html = await readFixture("no-images.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getImageSources();

      expect(sources).toEqual([]);
    });

    it("должен игнорировать изображения без атрибута src", async () => {
      const html = await readFixture("images-without-src.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getImageSources();

      expect(sources).toEqual(["/valid.png"]);
    });
  });

  describe("getScriptSources", () => {
    it("должен извлекать src скриптов", async () => {
      const html = await readFixture("scripts-multiple.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getScriptSources();

      expect(sources).toEqual([
        "/js/app.js",
        "https://cdn.example.com/lib.js",
        "/js/analytics.js",
      ]);
    });

    it("должен игнорировать инлайн скрипты", async () => {
      const html = await readFixture("scripts-with-inline.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getScriptSources();

      expect(sources).toEqual(["/js/app.js"]);
    });

    it("должен возвращать пустой массив если нет скриптов", async () => {
      const html = await readFixture("no-scripts.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getScriptSources();

      expect(sources).toEqual([]);
    });
  });

  describe("getLinkSources", () => {
    it("должен извлекать href всех link элементов", async () => {
      const html = await readFixture("styles-multiple.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getLinkSources();

      expect(sources).toEqual([
        "/css/main.css",
        "https://cdn.example.com/style.css",
        "/favicon.ico",
      ]);
    });

    it("должен игнорировать style элементы", async () => {
      const html = await readFixture("styles-with-inline.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getLinkSources();

      expect(sources).toEqual(["/css/main.css"]);
    });

    it("должен возвращать пустой массив если нет стилей", async () => {
      const html = await readFixture("no-styles.html");

      const parser = new HtmlParserService(html);
      const sources = parser.getLinkSources();

      expect(sources).toEqual([]);
    });
  });

  describe("replaceResourceSource", () => {
    it("должен заменять src изображения", async () => {
      const html = await readFixture("replace-image.html");

      const parser = new HtmlParserService(html);
      parser.replaceResourceSource(
        "img",
        "src",
        "/assets/image.png",
        "/new/path/image.png"
      );

      const updatedHtml = parser.getHtml();
      expect(updatedHtml).toContain('src="/new/path/image.png"');
      expect(updatedHtml).not.toContain('src="/assets/image.png"');
    });

    it("должен заменять src скрипта", async () => {
      const html = await readFixture("replace-script.html");

      const parser = new HtmlParserService(html);
      parser.replaceResourceSource(
        "script",
        "src",
        "/js/app.js",
        "/new/app.js"
      );

      const updatedHtml = parser.getHtml();
      expect(updatedHtml).toContain('src="/new/app.js"');
      expect(updatedHtml).not.toContain('src="/js/app.js"');
    });

    it("должен заменять href стиля", async () => {
      const html = await readFixture("replace-style.html");

      const parser = new HtmlParserService(html);
      parser.replaceResourceSource(
        "link",
        "href",
        "/css/main.css",
        "/new/main.css"
      );

      const updatedHtml = parser.getHtml();
      expect(updatedHtml).toContain('href="/new/main.css"');
      expect(updatedHtml).not.toContain('href="/css/main.css"');
    });

    it("должен заменять только нужный ресурс при наличии нескольких", async () => {
      const html = await readFixture("replace-multiple-images.html");

      const parser = new HtmlParserService(html);
      parser.replaceResourceSource(
        "img",
        "src",
        "/image1.png",
        "/new/image1.png"
      );

      const updatedHtml = parser.getHtml();
      expect(updatedHtml).toContain('src="/new/image1.png"');
      expect(updatedHtml).toContain('src="/image2.png"');
    });
  });

  describe("getHtml", () => {
    it("должен возвращать HTML строку", async () => {
      const html = await readFixture("simple.html");

      const parser = new HtmlParserService(html);
      const result = parser.getHtml();

      expect(result).toContain("<h1>Test</h1>");
    });

    it("должен возвращать обновленный HTML после изменений", async () => {
      const html = await readFixture("replace-image.html");

      const parser = new HtmlParserService(html);
      parser.replaceResourceSource(
        "img",
        "src",
        "/assets/image.png",
        "/new.png"
      );
      const result = parser.getHtml();

      expect(result).toContain('src="/new.png"');
    });
  });
});
