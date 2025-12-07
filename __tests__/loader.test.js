import nock from "nock";
import { loader } from "../src/services/loader.service.js";

describe("loader", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe("load", () => {
    it("должен загрузить HTML-контент", async () => {
      const url = "https://example.com/page";
      const htmlContent = "<html><body>Test page</body></html>";

      nock("https://example.com").get("/page").reply(200, htmlContent);

      const data = await loader.load(url);

      expect(data).toBe(htmlContent);
    });

    it("должен загрузить CSS-контент", async () => {
      const url = "https://example.com/styles.css";
      const cssContent = "body { color: red; }";

      nock("https://example.com").get("/styles.css").reply(200, cssContent);

      const data = await loader.load(url);

      expect(data).toBe(cssContent);
    });

    it("должен обработать ошибку при неудачном HTTP-запросе", async () => {
      const url = "https://example.com/notfound";

      nock("https://example.com").get("/notfound").reply(404);

      await expect(loader.load(url)).rejects.toThrow();
    });

    it("должен обработать ошибку сети", async () => {
      const url = "https://example.com/error";

      nock("https://example.com").get("/error").replyWithError("Network error");

      await expect(loader.load(url)).rejects.toThrow();
    });

    it("должен загружать бинарные данные с правильной конфигурацией", async () => {
      const url = "https://example.com/image.png";
      const imageBuffer = Buffer.from("fake-image-data");

      nock("https://example.com")
        .get("/image.png")
        .reply(200, imageBuffer);

      const data = await loader.load(url, { responseType: "arraybuffer" });

      expect(Buffer.isBuffer(data)).toBe(true);
    });
  });

  describe("loadResources", () => {
    it("должен загрузить несколько ресурсов", async () => {
      const urls = [
        "https://example.com/image1.png",
        "https://example.com/image2.jpg",
        "https://example.com/script.js",
      ];

      nock("https://example.com")
        .get("/image1.png")
        .reply(200, Buffer.from("image1"))
        .get("/image2.jpg")
        .reply(200, Buffer.from("image2"))
        .get("/script.js")
        .reply(200, Buffer.from("script"));

      const resources = await loader.loadResources(urls);

      expect(resources).toHaveLength(3);
      expect(resources.every((data) => Buffer.isBuffer(data))).toBe(true);
    });

    it("должен загружать ресурсы как arraybuffer", async () => {
      const urls = [
        "https://example.com/style.css",
        "https://example.com/app.js",
      ];

      nock("https://example.com")
        .get("/style.css")
        .reply(200, "body { color: red; }")
        .get("/app.js")
        .reply(200, "console.log('test');");

      const resources = await loader.loadResources(urls);

      expect(resources).toHaveLength(2);
      expect(resources.every((data) => Buffer.isBuffer(data))).toBe(true);
    });

    it("должен возвращать пустой массив для пустого списка URL", async () => {
      const resources = await loader.loadResources([]);

      expect(resources).toEqual([]);
    });

    it("должен обработать ошибку при загрузке одного из ресурсов", async () => {
      const urls = [
        "https://example.com/valid.png",
        "https://example.com/invalid.png",
      ];

      nock("https://example.com")
        .get("/valid.png")
        .reply(200, Buffer.from("valid"))
        .get("/invalid.png")
        .reply(404);

      await expect(loader.loadResources(urls)).rejects.toThrow();
    });

    it("должен загружать ресурсы с разных доменов", async () => {
      const urls = [
        "https://example.com/resource1.js",
        "https://cdn.example.com/resource2.css",
        "https://assets.example.com/resource3.png",
      ];

      nock("https://example.com")
        .get("/resource1.js")
        .reply(200, Buffer.from("js"));

      nock("https://cdn.example.com")
        .get("/resource2.css")
        .reply(200, Buffer.from("css"));

      nock("https://assets.example.com")
        .get("/resource3.png")
        .reply(200, Buffer.from("png"));

      const resources = await loader.loadResources(urls);

      expect(resources).toHaveLength(3);
      expect(resources.every((data) => Buffer.isBuffer(data))).toBe(true);
    });

    it("должен сохранять порядок загруженных ресурсов", async () => {
      const urls = [
        "https://example.com/first.png",
        "https://example.com/second.png",
        "https://example.com/third.png",
      ];

      nock("https://example.com")
        .get("/first.png")
        .reply(200, Buffer.from("first"))
        .get("/second.png")
        .reply(200, Buffer.from("second"))
        .get("/third.png")
        .reply(200, Buffer.from("third"));

      const resources = await loader.loadResources(urls);

      expect(resources[0].toString()).toBe("first");
      expect(resources[1].toString()).toBe("second");
      expect(resources[2].toString()).toBe("third");
    });
  });
});
