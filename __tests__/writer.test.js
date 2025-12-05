import fs from "node:fs/promises";
import path from "path";
import os from "os";
import { write } from "../src/utils/writer.js";

describe("write", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "page-loader-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("должен сохранить данные в файл", async () => {
    const fileName = "test.html";
    const content = "<html><body>Test</body></html>";

    const filePath = await write(tempDir, fileName, content);

    const savedContent = await fs.readFile(filePath, "utf-8");
    expect(savedContent).toBe(content);
  });

  it("должен вернуть путь к сохраненному файлу", async () => {
    const fileName = "test.html";
    const content = "<html><body>Test</body></html>";

    const filePath = await write(tempDir, fileName, content);

    expect(filePath).toBe(path.join(tempDir, fileName));
    expect(path.isAbsolute(filePath)).toBe(true);
  });

  it("должен работать с разными типами файлов", async () => {
    const cssFileName = "styles.css";
    const cssContent = "body { color: red; }";

    const filePath = await write(tempDir, cssFileName, cssContent);

    const savedContent = await fs.readFile(filePath, "utf-8");
    expect(savedContent).toBe(cssContent);
  });

  it("должен выбросить ошибку при записи в несуществующую директорию", async () => {
    const fileName = "test.html";
    const content = "<html><body>Test</body></html>";
    const invalidDir = "/nonexistent/directory";

    await expect(write(invalidDir, fileName, content)).rejects.toThrow();
  });
});
