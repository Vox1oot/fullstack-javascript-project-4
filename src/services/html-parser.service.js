import * as cheerio from 'cheerio';

export class HtmlParserService {
  constructor(html) {
    this._$ = cheerio.load(html);
  }

  getImageSources() {
    return this._getResourceSources('img', 'src');
  }

  getScriptSources() {
    return this._getResourceSources('script', 'src');
  }

  getLinkSources() {
    return this._getResourceSources('link[href]', 'href');
  }

  _getResourceSources(selector, attribute) {
    const sources = [];
    this._$(selector).each((_, element) => {
      const source = this._$(element).attr(attribute);
      if (source && !source.startsWith('data:')) {
        sources.push(source);
      }
    });
    return sources;
  }

  replaceResourceSource(type, attribute, originalSource, newSource) {
    this._$(`${type}[${attribute}="${originalSource}"]`).attr(
      attribute,
      newSource,
    );
  }

  getHtml() {
    return this._$.html();
  }
}
