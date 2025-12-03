import nock from "nock";
import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { load } from "../src/utils/loader.js";

describe("load", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
    nock.cleanAll();
  });

  it("должен загрузить HTML-контент и сохранить в файл", async () => {
    const url = "https://example.com/page";
    const fileName = "example-com-page.html";
    const htmlContent = "<html><body>Test page</body></html>";

    nock("https://example.com").get("/page").reply(200, htmlContent);

    const filePath = await load(url, tempDir, fileName);

    expect(filePath).toBe(path.join(tempDir, fileName));

    const savedContent = await fs.readFile(filePath, "utf-8");
    expect(savedContent).toBe(htmlContent);
  });

  it("должен загрузить CSS-контент и сохранить в файл", async () => {
    const url = "https://example.com/styles.css";
    const fileName = "example-com-styles.css";
    const cssContent = "body { color: red; }";

    nock("https://example.com").get("/styles.css").reply(200, cssContent);

    const filePath = await load(url, tempDir, fileName);

    expect(filePath).toBe(path.join(tempDir, fileName));

    const savedContent = await fs.readFile(filePath, "utf-8");
    expect(savedContent).toBe(cssContent);
  });

  it("должен загрузить изображение и сохранить в файл", async () => {
    const url = "https://example.com/image.png";
    const fileName = "example-com-image.png";
    const imageBuffer = Buffer.from("fake-image-data");

    nock("https://example.com").get("/image.png").reply(200, imageBuffer);

    const filePath = await load(url, tempDir, fileName);

    expect(filePath).toBe(path.join(tempDir, fileName));

    const savedContent = await fs.readFile(filePath);
    expect(savedContent.toString()).toBe(imageBuffer.toString());
  });

  it("должен обработать ошибку при неудачном HTTP-запросе", async () => {
    const url = "https://example.com/notfound";
    const fileName = "example-com-notfound.html";

    nock("https://example.com").get("/notfound").reply(404);

    await expect(load(url, tempDir, fileName)).rejects.toThrow();
  });

  it("должен обработать ошибку сети", async () => {
    const url = "https://example.com/error";
    const fileName = "example-com-error.html";

    nock("https://example.com").get("/error").replyWithError("Network error");

    await expect(load(url, tempDir, fileName)).rejects.toThrow();
  });

  it("должен вернуть путь к сохраненному файлу", async () => {
    const url = "https://example.com/test";
    const fileName = "test.html";
    const htmlContent = "<html><body>Test</body></html>";

    nock("https://example.com").get("/test").reply(200, htmlContent);

    const filePath = await load(url, tempDir, fileName);

    expect(filePath).toBe(path.join(tempDir, fileName));
    expect(path.isAbsolute(filePath)).toBe(true);
  });

  it("должен работать с разными директориями вывода", async () => {
    const url = "https://example.com/page";
    const fileName = "page.html";
    const htmlContent = "<html><body>Test</body></html>";
    const customDir = path.join(tempDir, "custom");

    await fs.mkdir(customDir);

    nock("https://example.com").get("/page").reply(200, htmlContent);

    const filePath = await load(url, customDir, fileName);

    expect(filePath).toBe(path.join(customDir, fileName));

    const savedContent = await fs.readFile(filePath, "utf-8");
    expect(savedContent).toBe(htmlContent);
  });
});
