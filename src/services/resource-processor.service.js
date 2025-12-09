import Debug from 'debug';
import { formatFilePath, formatDirPath } from '../utils/formatter.js';
import { loader } from './loader.service.js';
import { writeFile } from '../utils/writeFile.js';
import { buildResourceUrl } from '../utils/buildResourceUrl.js';
import path from 'path';

const debug = Debug('page-loader:resource-processor');

export class ResourceProcessorService {
  #_resourceTypes = ['images', 'scripts', 'links'];

  constructor(baseUrl, outputDir, htmlParser) {
    this.baseUrl = baseUrl;
    this.outputDir = outputDir;
    this.htmlParser = htmlParser;
    this.resourceDirName = path.resolve(outputDir, formatDirPath(baseUrl));
    this.baseHostname = new URL(baseUrl).hostname;

    debug('инициализирован обработчик ресурсов');
    debug('базовый url: %s', baseUrl);
    debug('директория вывода: %s', outputDir);
    debug('директория ресурсов: %s', this.resourceDirName);
    debug('базовый hostname: %s', this.baseHostname);
  }

  /**
   * @param {'images' | 'scripts' | 'links'} resourceType
   * @returns {Promise<void>}
   */
  processResources(resourceType) {
    debug('обрабатываем ресурсы типа: %s', resourceType);

    if (!this.#_resourceTypes.includes(resourceType)) {
      return Promise.reject(
        new Error(
          `Поддерживаются только следующие типы ресурсов: ${this.#_resourceTypes.join(
            ', ',
          )}`,
        ),
      );
    }

    const resources = this._extractResources(resourceType);
    debug('найдено %d ресурсов типа %s', resources.length, resourceType);

    if (resources.length === 0) {
      debug('нет ресурсов типа %s для обработки', resourceType);
      return Promise.resolve();
    }

    resources.forEach((r) => debug('  - %s -> %s', r.url, r.fileName));

    return loader
      .loadResources(resources.map((r) => r.url))
      .then((resourcesData) => {
        debug(
          'сохраняем %d ресурсов типа %s',
          resourcesData.length,
          resourceType,
        );
        const savePromises = resourcesData.map((data, index) => {
          const resource = resources[index];
          return this._saveAndUpdateResource(resource, data);
        });

        return Promise.all(savePromises);
      })
      .then(() => {
        debug('все ресурсы типа %s обработаны успешно', resourceType);
      });
  }

  _extractResources(resourceType) {
    const extractors = this.#_resourceTypes.reduce((acc, type) => {
      acc[type] =
        this[`_extract${type.charAt(0).toUpperCase() + type.slice(1)}`].bind(
          this,
        );
      return acc;
    }, {});

    const extractor = extractors[resourceType];
    return extractor ? extractor() : [];
  }

  _isLocalResource(resourceUrl) {
    try {
      const resourceHostname = new URL(resourceUrl).hostname;
      return resourceHostname === this.baseHostname;
    } catch {
      return false;
    }
  }

  _extractImages() {
    const imagePaths = this.htmlParser.getImageSources();
    return imagePaths
      .map((originalPath) => {
        const url = buildResourceUrl(this.baseUrl, originalPath);
        return {
          originalPath,
          url,
          fileName: formatFilePath(url),
          type: 'img',
          attribute: 'src',
        };
      })
      .filter((resource) => this._isLocalResource(resource.url));
  }

  _extractScripts() {
    const scriptPaths = this.htmlParser.getScriptSources();
    return scriptPaths
      .map((originalPath) => {
        const url = buildResourceUrl(this.baseUrl, originalPath);
        return {
          originalPath,
          url,
          fileName: formatFilePath(url),
          type: 'script',
          attribute: 'src',
        };
      })
      .filter((resource) => this._isLocalResource(resource.url));
  }

  _extractLinks() {
    const linkPaths = this.htmlParser.getLinkSources();
    return linkPaths
      .map((originalPath) => {
        const url = buildResourceUrl(this.baseUrl, originalPath);
        return {
          originalPath,
          url,
          fileName: formatFilePath(url),
          type: 'link',
          attribute: 'href',
        };
      })
      .filter((resource) => this._isLocalResource(resource.url));
  }

  _saveAndUpdateResource(resource, data) {
    debug('сохраняем ресурс: %s', resource.fileName);
    return writeFile(this.resourceDirName, resource.fileName, data).then(() => {
      const newPath = path.join(formatDirPath(this.baseUrl), resource.fileName);
      debug('обновляем html: %s -> %s', resource.originalPath, newPath);
      this.htmlParser.replaceResourceSource(
        resource.type,
        resource.attribute,
        resource.originalPath,
        newPath,
      );
    });
  }
}
