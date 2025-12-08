### Github Actions Status:

[![Actions Status](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Vox1oot/fullstack-javascript-project-4/actions)
[![CI](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/ci.yml/badge.svg)](https://github.com/Vox1oot/fullstack-javascript-project-4/actions/workflows/ci.yml)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Vox1oot_fullstack-javascript-project-4&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Vox1oot_fullstack-javascript-project-4)

## Page-Loader

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

### Отладка

Утилита поддерживает логирование с помощью библиотеки `debug`. Для включения логов используйте переменную окружения `DEBUG`:

#### Все логи приложения

```bash
DEBUG=page-loader:* page-loader -o ./resources https://example.com
```

#### Логи конкретных модулей

```bash
# Только HTTP-запросы и загрузка
DEBUG=page-loader:loader page-loader -o ./resources https://example.com

# Только обработка ресурсов
DEBUG=page-loader:resource-processor page-loader -o ./resources https://example.com

# Только задачи
DEBUG=page-loader:tasks page-loader -o ./resources https://example.com

# Основной процесс приложения
DEBUG=page-loader:main page-loader -o ./resources https://example.com
```

### Разработка

Запуск тестов:

```bash
# Только тесты
npm test

# Тесты и дебаг
npm test:debug

# Тесты в режиме отслеживания
npm test:watch
```

Запуск линтера:

```bash
npm run lint
```

### Asciinema

https://asciinema.org/a/3rG0IDamNmHeDwQmcLmYvLDCs
