import { buildResourceUrl } from '../src/utils/buildResourceUrl.js';

describe('buildResourceUrl', () => {
  describe('абсолютные URL', () => {
    it('должен возвращать абсолютный URL без изменений', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = 'https://cdn.example.com/assets/image.png';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://cdn.example.com/assets/image.png');
    });

    it('должен обрабатывать абсолютные URL с разными протоколами', () => {
      const baseUrl = 'https://example.com';
      const resourcePath = 'http://cdn.example.com/script.js';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('http://cdn.example.com/script.js');
    });
  });

  describe('относительные пути от корня', () => {
    it('должен строить URL для пути начинающегося с /', () => {
      const baseUrl = 'https://example.com/some/page';
      const resourcePath = '/assets/image.png';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/assets/image.png');
    });

    it('должен использовать origin базового URL', () => {
      const baseUrl = 'https://subdomain.example.com:8080/path/to/page';
      const resourcePath = '/css/style.css';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://subdomain.example.com:8080/css/style.css');
    });

    it('должен обрабатывать множественные слэши', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = '/path/to/resource/file.js';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/path/to/resource/file.js');
    });
  });

  describe('относительные пути', () => {
    it('должен строить URL для относительного пути', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = 'assets/image.png';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/assets/image.png');
    });

    it('должен обрабатывать вложенные относительные пути', () => {
      const baseUrl = 'https://example.com/folder/page';
      const resourcePath = 'assets/icons/icon.svg';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/assets/icons/icon.svg');
    });
  });

  describe('обработка ошибок', () => {
    it('должен возвращать исходный путь при ошибке парсинга', () => {
      const baseUrl = 'https://example.com';
      const resourcePath = 'javascript:void(0)';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('javascript:void(0)');
    });

    it('должен обрабатывать некорректные URL', () => {
      const baseUrl = 'invalid-url';
      const resourcePath = '/assets/image.png';

      expect(() => buildResourceUrl(baseUrl, resourcePath)).toThrow();
    });
  });

  describe('специальные случаи', () => {
    it('должен обрабатывать пустой путь', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = '';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/');
    });

    it('должен обрабатывать якорные ссылки', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = '#section';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/#section');
    });

    it('должен обрабатывать query параметры', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = '/api/data?param=value';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/api/data?param=value');
    });

    it('должен обрабатывать пути с точками', () => {
      const baseUrl = 'https://example.com/page';
      const resourcePath = './assets/image.png';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/assets/image.png');
    });

    it('должен обрабатывать пути с родительскими директориями', () => {
      const baseUrl = 'https://example.com/folder/page';
      const resourcePath = '../assets/image.png';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/assets/image.png');
    });
  });

  describe('различные форматы файлов', () => {
    it('должен обрабатывать изображения', () => {
      const baseUrl = 'https://example.com';
      const resourcePath = '/images/photo.jpg';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/images/photo.jpg');
    });

    it('должен обрабатывать скрипты', () => {
      const baseUrl = 'https://example.com';
      const resourcePath = '/js/app.min.js';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/js/app.min.js');
    });

    it('должен обрабатывать стили', () => {
      const baseUrl = 'https://example.com';
      const resourcePath = '/css/main.css';

      const result = buildResourceUrl(baseUrl, resourcePath);

      expect(result).toBe('https://example.com/css/main.css');
    });
  });
});
