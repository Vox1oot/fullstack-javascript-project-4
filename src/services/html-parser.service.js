import * as cheerio from "cheerio";

export class HtmlParserService {
  constructor(html) {
    this._$ = cheerio.load(html);
  }

  getImageSources() {
    return this._getResourceSources("img", "src");
  }

  getScriptSources() {
    return this._getResourceSources("script", "src");
  }

  getStyleSources() {
    return this._getResourceSources("link[rel='stylesheet']", "href");
  }

  _getResourceSources(selector, attribute) {
    const sources = [];
    this._$(selector).each((_, element) => {
      const value = this._$(element).attr(attribute);
      if (value && this._isLocalResource(value)) {
        sources.push(value);
      }
    });
    return sources;
  }

  _isLocalResource(url) {
    return !(
      url.startsWith("data:") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    );
  }

  replaceResourcePath(type, attribute, originalPath, newPath) {
    this._$(`${type}[${attribute}="${originalPath}"]`).attr(attribute, newPath);
  }

  getHtml() {
    return this._$.html();
  }
}
