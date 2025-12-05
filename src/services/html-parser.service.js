import * as cheerio from "cheerio";

export class HtmlParserService {
  constructor(html) {
    this.$ = cheerio.load(html);
  }

  getImageSources() {
    const sources = [];
    this.$("img").each((_, element) => {
      const src = this.$(element).attr("src");
      if (src) {
        sources.push(src);
      }
    });
    return sources;
  }
}
