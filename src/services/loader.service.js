import axios from "axios";
import Debug from "debug";

const debug = Debug("page-loader:loader");

class Loader {
  constructor() {}

  load(url, config) {
    debug("загружаем страницу: %s", url);
    return axios
      .get(url, config)
      .then((response) => {
        debug("страница загружена успешно: %s (статус: %d)", url, response.status);
        return response.data;
      })
      .catch((error) => {
        debug("ошибка загрузки страницы: %s (ошибка: %s)", url, error.message);
        throw error;
      });
  }

  loadResources(urls) {
    debug("загружаем %d ресурсов", urls.length);
    urls.forEach((url) => debug("  - %s", url));

    return Promise.all(
      urls.map((url) => this.load(url, { responseType: "arraybuffer" }))
    ).then((results) => {
      debug("все %d ресурсов загружены успешно", urls.length);
      return results;
    });
  }
}

export const loader = new Loader();
