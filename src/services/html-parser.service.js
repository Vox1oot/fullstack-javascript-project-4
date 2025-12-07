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
      const source = this._$(element).attr(attribute);
      if (source && !source.startsWith("data:")) {
        sources.push(source);
      }
    });
    return sources;
  }

  replaceResourcePath(type, attribute, originalPath, newPath) {
    this._$(`${type}[${attribute}="${originalPath}"]`).attr(attribute, newPath);
  }

  getHtml() {
    return this._$.html();
  }
}
