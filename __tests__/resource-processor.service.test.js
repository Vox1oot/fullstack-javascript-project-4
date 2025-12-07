import nock from "nock";
import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { ResourceProcessorService } from "../src/services/resource-processor.service.js";
import { HtmlParserService } from "../src/services/html-parser.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) =>
  path.join(__dirname, "..", "__fixtures__", "resource-processor", filename);

const readFixture = (filename) =>
  fs.readFile(getFixturePath(filename), "utf-8");

describe("ResourceProcessorService", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    nock.cleanAll();
  });

  describe("processResources - images", () => {
    it("должен обрабатывать изображения", async () => {
      const baseUrl = "https://example.com/page";
      const html = await readFixture("single-image.html");

      const imageData = Buffer.from("fake-image-data");

      nock("https://example.com")
        .get("/assets/image.png")
        .reply(200, imageData);

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("images");

      const resourceDir = path.join(tempDir, "example-com-page_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toContain("example-com-assets-image.png");
    });

    it("должен обновлять пути к изображениям в HTML", async () => {
      const baseUrl = "https://example.com/page";
      const html = await readFixture("single-image.html");

      const imageData = Buffer.from("fake-image-data");

      nock("https://example.com")
        .get("/assets/image.png")
        .reply(200, imageData);

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("images");

      const updatedHtml = htmlParser.getHtml();
      expect(updatedHtml).toContain("example-com-page_files");
      expect(updatedHtml).toContain("example-com-assets-image.png");
      expect(updatedHtml).not.toContain('src="/assets/image.png"');
    });

    it("должен обрабатывать несколько изображений", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("multiple-images.html");

      nock("https://example.com")
        .get("/image1.png")
        .reply(200, Buffer.from("img1"))
        .get("/image2.jpg")
        .reply(200, Buffer.from("img2"))
        .get("/image3.svg")
        .reply(200, Buffer.from("img3"));

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("images");

      const resourceDir = path.join(tempDir, "example-com_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(3);
    });

    it("должен возвращать resolved промис если нет изображений", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("no-images.html");

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await expect(processor.processResources("images")).resolves.toBeUndefined();
    });
  });

  describe("processResources - scripts", () => {
    it("должен обрабатывать скрипты", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("single-script.html");

      const scriptData = "console.log('test');";

      nock("https://example.com")
        .get("/js/app.js")
        .reply(200, scriptData);

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("scripts");

      const resourceDir = path.join(tempDir, "example-com_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toContain("example-com-js-app.js");
    });

    it("должен обновлять пути к скриптам в HTML", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("single-script.html");

      nock("https://example.com")
        .get("/js/app.js")
        .reply(200, "console.log('test');");

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("scripts");

      const updatedHtml = htmlParser.getHtml();
      expect(updatedHtml).toContain("example-com_files");
      expect(updatedHtml).toContain("example-com-js-app.js");
      expect(updatedHtml).not.toContain('src="/js/app.js"');
    });
  });

  describe("processResources - styles", () => {
    it("должен обрабатывать стили", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("single-style.html");

      const cssData = "body { color: red; }";

      nock("https://example.com")
        .get("/css/main.css")
        .reply(200, cssData);

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("styles");

      const resourceDir = path.join(tempDir, "example-com_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toContain("example-com-css-main.css");
    });

    it("должен обновлять пути к стилям в HTML", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("single-style.html");

      nock("https://example.com")
        .get("/css/main.css")
        .reply(200, "body { color: red; }");

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("styles");

      const updatedHtml = htmlParser.getHtml();
      expect(updatedHtml).toContain("example-com_files");
      expect(updatedHtml).toContain("example-com-css-main.css");
      expect(updatedHtml).not.toContain('href="/css/main.css"');
    });
  });

  describe("processResources - validation", () => {
    it("должен отклонять промис для неподдерживаемого типа ресурса", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("empty.html");

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await expect(processor.processResources("videos")).rejects.toThrow(
        "Поддерживаются только следующие типы ресурсов: images, scripts, styles"
      );
    });
  });

  describe("resourceDirName", () => {
    it("должен создавать правильное имя директории для ресурсов", async () => {
      const baseUrl = "https://example.com/page";
      const html = await readFixture("empty.html");

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      expect(processor.resourceDirName).toBe(
        path.resolve(tempDir, "example-com-page_files")
      );
    });
  });

  describe("обработка абсолютных и относительных путей", () => {
    it("должен обрабатывать абсолютные URL", async () => {
      const baseUrl = "https://example.com";
      const html = await readFixture("absolute-url.html");

      nock("https://cdn.example.com")
        .get("/image.png")
        .reply(200, Buffer.from("img"));

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("images");

      const resourceDir = path.join(tempDir, "example-com_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(1);
    });

    it("должен обрабатывать относительные пути", async () => {
      const baseUrl = "https://example.com/page";
      const html = await readFixture("relative-path.html");

      nock("https://example.com")
        .get("/assets/image.png")
        .reply(200, Buffer.from("img"));

      const htmlParser = new HtmlParserService(html);
      const processor = new ResourceProcessorService(baseUrl, tempDir, htmlParser);

      await processor.processResources("images");

      const resourceDir = path.join(tempDir, "example-com-page_files");
      const files = await fs.readdir(resourceDir);
      expect(files).toHaveLength(1);
    });
  });
});
