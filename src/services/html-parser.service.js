import * as cheerio from "cheerio";

export class HtmlParserService {
  constructor(html) {
    this._$ = cheerio.load(html);
  }

  getImageSources() {
    const sources = [];
    this._$("img").each((_, element) => {
      const src = this._$(element).attr("src");
      if (src && !(src.startsWith("data") || src.startsWith("http"))) {
        sources.push(src);
      }
    });
    return sources;
  }

  replaceImgBySrc(src, newValue) {
    this._$(`img[src="${src}"]`).attr("src", newValue);
  }

  getHtml() {
    return this._$.html();
  }
}
