import { formatter } from "../src/utils/formatter.js";

describe("formatter", () => {
  it.each([
    ["https://example.com", "example-com.html"],
    ["http://example.com", "example-com.html"],
    ["https://ru.hexlet.io/courses", "ru-hexlet-io-courses.html"],
    ["https://example.com/path/to/page", "example-com-path-to-page.html"],
    ["https://example.com/", "example-com.html"],
    ["https://example.com/courses/", "example-com-courses.html"],
  ])("должен форматировать URL %s в %s", (url, expected) => {
    expect(formatter(url)).toBe(expected);
  });

  it.each([
    ["https://example.com", "example_com.html"],
    ["https://example.com/path/to/page", "example_com_path_to_page.html"],
  ])("должен форматировать URL %s в %s", (url, expected) => {
    expect(formatter(url, "_")).toBe(expected);
  });

  it.each([
    ["https://example.com/assets/index", "example_com_assets_index.css"],
  ])("должен форматировать URL %s в %s", (url, expected) => {
    expect(formatter(url, "_", "css")).toBe(expected);
  });
});
