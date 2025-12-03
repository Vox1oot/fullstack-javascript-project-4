### Hexlet tests and linter status:

[![Actions Status](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Vox1oot/fullstack-javascript-project-4/actions)
[![CI](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/ci.yml/badge.svg)](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/ci.yml)

## Page Loader

CLI утилита для загрузки веб-страниц и их ресурсов на локальный диск.

### Установка

```bash
npm install
npm link
```

### Использование

```bash
page-loader [options] <url>
```

#### Опции

- `-V, --version` - вывести версию утилиты
- `-o, --output [dir]` - директория для сохранения файлов (по умолчанию: текущая директория)
- `-h, --help` - вывести справку

#### Примеры

Загрузить страницу в текущую директорию:

```bash
page-loader https://example.com
```

Загрузить страницу в указанную директорию:

```bash
page-loader --output /var/tmp https://example.com
```

### Разработка

Запуск тестов:

```bash
npm test
```

Запуск линтера:

```bash
npm run lint
```
