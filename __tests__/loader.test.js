import nock from "nock";
import { loader } from "../src/services/loader.service.js";

describe("loader", () => {
  afterEach(() => {
    nock.cleanAll();
  });

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
});
