import fs from 'node:fs/promises';
import path from 'path';
import os from 'os';
import { writeFile } from '../src/utils/writeFile.js';

describe('writeFile', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('должен сохранить данные в файл', async () => {
    const fileName = 'test.html';
    const content = '<html><body>Test</body></html>';

    const filePath = await writeFile(tempDir, fileName, content);

    const savedContent = await fs.readFile(filePath, 'utf-8');
    expect(savedContent).toBe(content);
  });

  it('должен вернуть путь к сохраненному файлу', async () => {
    const fileName = 'test.html';
    const content = '<html><body>Test</body></html>';

    const filePath = await writeFile(tempDir, fileName, content);

    expect(filePath).toBe(path.join(tempDir, fileName));
    expect(path.isAbsolute(filePath)).toBe(true);
  });

  it('должен работать с разными типами файлов', async () => {
    const cssFileName = 'styles.css';
    const cssContent = 'body { color: red; }';

    const filePath = await writeFile(tempDir, cssFileName, cssContent);

    const savedContent = await fs.readFile(filePath, 'utf-8');
    expect(savedContent).toBe(cssContent);
  });

  it('должен создать директорию если она не существует', async () => {
    const newDir = path.join(tempDir, 'new', 'nested', 'dir');
    const fileName = 'test.html';
    const content = '<html><body>Test</body></html>';

    const filePath = await writeFile(newDir, fileName, content);

    const savedContent = await fs.readFile(filePath, 'utf-8');
    expect(savedContent).toBe(content);
    expect(filePath).toBe(path.join(newDir, fileName));
  });

  describe('error handling', () => {
    it('должен выбросить ошибку при записи в защищенную директорию', async () => {
      const fileName = 'test.html';
      const content = '<html><body>Test</body></html>';
      const invalidDir = '/root/protected';

      await expect(writeFile(invalidDir, fileName, content)).rejects.toThrow();
    });

    it('должен выбросить ошибку при недостатке прав на создание директории', async () => {
      const fileName = 'test.html';
      const content = '<html><body>Test</body></html>';
      const invalidDir = '/sys/kernel';

      await expect(writeFile(invalidDir, fileName, content)).rejects.toThrow();
    });

    it('должен выбросить ошибку при попытке записи файла с недопустимым именем', async () => {
      const invalidFileName = 'test\x00.html';
      const content = '<html><body>Test</body></html>';

      await expect(writeFile(tempDir, invalidFileName, content)).rejects.toThrow();
    });
  });
});
