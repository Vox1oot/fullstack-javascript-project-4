import axios from 'axios';
import Debug from 'debug';

const debug = Debug('page-loader:loader');

class Loader {
  #_statusMessages = {
    404: 'Ресурс не найден (404):',
    403: 'Доступ запрещен (403):',
    500: 'Ошибка сервера (500):',
    default: 'HTTP ошибка при загрузке ресурса:',
  };

  constructor() {}

  load(url, config) {
    debug('загружаем страницу: %s', url);
    return axios
      .get(url, config)
      .then((response) => {
        debug(
          'страница загружена успешно: %s (статус: %d)',
          url,
          response.status,
        );
        return response.data;
      })
      .catch((error) => {
        debug('ошибка загрузки страницы: %s', error.message);

        if (error.response) {
          const { status } = error.response;
          const message =
            this.#_statusMessages[status] || this.#_statusMessages.default;
          throw new Error(`${message} ${url}`);
        }

        throw new Error(`Ошибка загрузки ${url}: ${error.message}`);
      });
  }

  loadResources(urls) {
    debug('загружаем %d ресурсов', urls.length);
    urls.forEach((url) => debug('  - %s', url));

    return Promise.all(
      urls.map((url) => this.load(url, { responseType: 'arraybuffer' })),
    ).then((results) => {
      debug('все %d ресурсов загружены успешно', urls.length);
      return results;
    });
  }
}

export const loader = new Loader();
