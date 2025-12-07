import { formatFilePath, formatDirPath } from "../utils/formatter.js";
import { loader } from "./loader.service.js";
import { writeFile } from "../utils/writeFile.js";
import { buildResourceUrl } from "../utils/buildResourceUrl.js";
import path from "path";

export class ResourceProcessorService {
  #_resourceTypes = ["images", "scripts", "links"];

  constructor(baseUrl, outputDir, htmlParser) {
    this.baseUrl = baseUrl;
    this.outputDir = outputDir;
    this.htmlParser = htmlParser;
    this.resourceDirName = path.resolve(outputDir, formatDirPath(baseUrl));
    this.baseHostname = new URL(baseUrl).hostname;
  }

  /**
   * @param {'images' | 'scripts' | 'links'} resourceType
   * @returns {Promise<void>}
   */
  processResources(resourceType) {
    if (!this.#_resourceTypes.includes(resourceType)) {
      return Promise.reject(
        new Error(
          `Поддерживаются только следующие типы ресурсов: ${this.#_resourceTypes.join(
            ", "
          )}`
        )
      );
    }

    const resources = this._extractResources(resourceType);

    if (resources.length === 0) {
      return Promise.resolve();
    }

    return loader
      .loadResources(resources.map((r) => r.url))
      .then((resourcesData) => {
        const savePromises = resourcesData.map((data, index) => {
          const resource = resources[index];
          return this._saveAndUpdateResource(resource, data);
        });

        return Promise.all(savePromises);
      });
  }

  _extractResources(resourceType) {
    const extractors = this.#_resourceTypes.reduce((acc, type) => {
      acc[type] =
        this[`_extract${type.charAt(0).toUpperCase() + type.slice(1)}`].bind(
          this
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
          type: "img",
          attribute: "src",
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
          type: "script",
          attribute: "src",
        };
      })
      .filter((resource) => this._isLocalResource(resource.url));
  }

  _extractLinks() {
    const stylePaths = this.htmlParser.getStyleSources();
    return stylePaths
      .map((originalPath) => {
        const url = buildResourceUrl(this.baseUrl, originalPath);
        return {
          originalPath,
          url,
          fileName: formatFilePath(url),
          type: "link",
          attribute: "href",
        };
      })
      .filter((resource) => this._isLocalResource(resource.url));
  }

  _saveAndUpdateResource(resource, data) {
    return writeFile(this.resourceDirName, resource.fileName, data).then(() => {
      const newPath = path.join(formatDirPath(this.baseUrl), resource.fileName);
      this.htmlParser.replaceResourceSource(
        resource.type,
        resource.attribute,
        resource.originalPath,
        newPath
      );
    });
  }
}
