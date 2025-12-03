import { load } from "../src/loader.js";
import nock from "nock";
import fs from "fs/promises";
import os from "os";
import path from "path";

let tempDir;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true });
  nock.cleanAll();
});

test("should download and save page", async () => {
  const url = "https://example.com/test";
  const html = "<html><body>Test</body></html>";

  nock("https://example.com").get("/test").reply(200, html);

  const filePath = await load(url, tempDir);

  expect(filePath).toContain("example-com-test.html");

  const content = await fs.readFile(filePath, "utf-8");
  expect(content).toBe(html);
});

test("should save page to specified directory", async () => {
  const url = "https://ru.hexlet.io/courses";
  const html = "<html><body>Hexlet</body></html>";

  nock("https://ru.hexlet.io").get("/courses").reply(200, html);

  const filePath = await load(url, tempDir);

  expect(filePath).toBe(path.join(tempDir, "ru-hexlet-io-courses.html"));
  expect(await fs.access(filePath).then(() => true).catch(() => false)).toBe(true);
});

test("should handle network errors", async () => {
  const url = "https://example.com/notfound";

  nock("https://example.com").get("/notfound").reply(404, "Not Found");

  await expect(load(url, tempDir)).rejects.toThrow("HTTP error 404");
});

test("should handle server errors", async () => {
  const url = "https://example.com/error";

  nock("https://example.com").get("/error").reply(500, "Internal Server Error");

  await expect(load(url, tempDir)).rejects.toThrow("HTTP error 500");
});

test("should handle connection errors", async () => {
  const url = "https://example.com/test";

  nock("https://example.com").get("/test").replyWithError("Connection failed");

  await expect(load(url, tempDir)).rejects.toThrow("Failed to load page");
});
