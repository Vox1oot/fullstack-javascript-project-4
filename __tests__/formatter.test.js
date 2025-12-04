import { formatFilePath, formatDirPath } from "../src/utils/formatter.js";

describe("formatter", () => {
  describe("formatFilePath", () => {
    it.each([
      ["https://example.com", "example-com.html"],
      ["http://example.com", "example-com.html"],
      ["https://ru.hexlet.io/courses", "ru-hexlet-io-courses.html"],
      ["https://example.com/path/to/page", "example-com-path-to-page.html"],
      ["https://example.com/", "example-com.html"],
      ["https://example.com/courses/", "example-com-courses.html"],
    ])("должен форматировать URL %s в %s", (url, expected) => {
      expect(formatFilePath(url)).toBe(expected);
    });

    it.each([
      ["https://example.com", "example_com.html"],
      ["https://example.com/path/to/page", "example_com_path_to_page.html"],
    ])(
      "должен форматировать URL %s с кастомным разделителем в %s",
      (url, expected) => {
        expect(formatFilePath(url, "_")).toBe(expected);
      }
    );

    it.each([
      [
        "https://example.com/assets/index",
        "examplecsscomcssassetscssindex.css",
      ],
    ])(
      "должен форматировать URL %s с кастомным расширением в %s",
      (url, expected) => {
        expect(formatFilePath(url, "css", "css")).toBe(expected);
      }
    );
  });

  describe("formatDirPath", () => {
    it.each([
      ["https://example.com", "example-com_files"],
      ["http://example.com", "example-com_files"],
      ["https://ru.hexlet.io/courses", "ru-hexlet-io-courses_files"],
      [
        "https://example.com/path/to/assets",
        "example-com-path-to-assets_files",
      ],
      ["https://example.com/", "example-com_files"],
      ["https://example.com/courses/", "example-com-courses-_files"],
      ["https://site.com/deep/nested/path", "site-com-deep-nested-path_files"],
    ])("должен форматировать URL %s в директорию %s", (url, expected) => {
      expect(formatDirPath(url)).toBe(expected);
    });

    it.each([
      ["https://example.com", "example_com_files"],
      ["https://example.com/assets", "example_com_assets_files"],
      [
        "https://ru.hexlet.io/courses/javascript",
        "ru_hexlet_io_courses_javascript_files",
      ],
    ])(
      "должен форматировать URL %s с кастомным разделителем в %s",
      (url, expected) => {
        expect(formatDirPath(url, "_")).toBe(expected);
      }
    );

    it("должен обрабатывать URL с особыми символами", () => {
      expect(formatDirPath("https://test-site.com/path/with_underscore")).toBe(
        "test-site-com-path-with-underscore_files"
      );
      expect(formatDirPath("https://127.0.0.1/api/v1")).toBe(
        "127-0-0-1-api-v1_files"
      );
    });
  });
});
