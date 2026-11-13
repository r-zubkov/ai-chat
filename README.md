# AI Chat

Full-stack приложение для чата с AI: создание диалогов, выбор модели, потоковый ответ модели и
локальное хранение истории.

## Что умеет приложение

- Создавать новые диалоги и продолжать существующие.
- Отправлять сообщения и получать потоковый ответ от сервера.
- Выбирать модель AI для текущего чата и глобально.
- Переименовывать/удалять чаты и очищать историю.
- Хранить историю и настройки локально в IndexedDB.
- Отображать Markdown и подсвечивать код.
- Устанавливаться как PWA-приложение.

## Технологический стек

### Frontend

- `Angular 22` (standalone components)
- `TypeScript` (`strict`)
- `Taiga UI` для интерфейса
- `@ngrx/signals` + Angular Signals для состояния
- `Dexie` + IndexedDB для локального хранения
- `socket.io-client` для потокового ответа
- `PWA` manifest + Service Worker
- `Less` для стилей

### Backend

- `Node.js` + `TypeScript` (`strict`)
- `Express` для HTTP API и статических файлов
- `Socket.IO` для потокового ответа
- `esbuild` для сборки backend

### Инструменты разработки

- `npm workspaces` для monorepo
- `ESLint` + `Prettier` для линтинга и форматирования
- `Vitest` + `Karma/Jasmine` для тестов
- `Husky` + `lint-staged` для pre-commit-проверок

## Архитектура

### Frontend

Frontend организован по FSD-слоям:

- `app` - bootstrap, роутинг, guards, app-level сервисы
- `pages` - маршрутизируемые страницы
- `widgets` - составные UI-блоки
- `features` - пользовательские сценарии
- `entities` - доменные модели, stores/repositories
- `shared` - инфраструктура, утилиты, конфигурация и общие UI-компоненты

Чаты, сообщения и настройки хранятся в IndexedDB: repositories отвечают за чтение и запись,
entity stores - за состояние данных в приложении.

### Backend

Backend разделён по ответственности:

- `environments` - development и production-конфигурация API
- `prompts` - системные prompts для разных семейств моделей
- `chat` - обработка запросов и общая логика чата
- `adapters` - интеграции с AI-провайдерами
- `transports` - HTTP и Socket.IO-интерфейсы

### Contracts

`@ai-chat/contracts` содержит общие для frontend и backend конфиги AI-моделей, типы и константы.

## Минимальные требования

- `Node.js 22+`
- `npm 10+`

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

Зависимости всех workspaces устанавливаются из корня проекта.

### 2. Настройка backend

Создайте локальный файл конфигурации AI-адаптеров:

- `apps/api/src/adapters/.env.example` → `apps/api/src/adapters/.env`

Заполните его настройками AI-провайдера, описанными в следующем разделе. API development environment
уже настроен на порт `5000`.

### 3. Запуск в локальном окружении

```bash
npm run dev
```

После запуска frontend доступен по адресу `http://localhost:4200`, backend - по адресу
`http://localhost:5000`.

## Конфигурация

### AI-провайдеры и адаптеры

Backend подключается к AI-провайдерам через адаптеры. Сейчас поддерживается только Timeweb Cloud AI.

Для загрузки конфигурации из файла передайте серверу аргумент `--adapters-env-file=<path>`. Без него
используются переменные окружения процесса. В файловом режиме переменные процесса не подмешиваются.

#### Timeweb Cloud AI

Укажите в env-файле:

- `AI_CHAT_TIMEWEB_USE` — включает адаптер (`true` или `false`, по умолчанию `false`);
- `AI_CHAT_TIMEWEB_API_KEY` — API-ключ;
- `AI_CHAT_TIMEWEB_AGENT_IDS` — ID агентов для доступных моделей.

Адаптер регистрируется только при `AI_CHAT_TIMEWEB_USE=true`, и тогда API-ключ и ID агентов
обязательны. При `false` или отсутствии флага остальные параметры Timeweb не требуются.

API-ключ и ID агентов доступны в панели Timeweb Cloud. Список ID моделей находится в
`packages/contracts/src/models/configs`.

### Файлы окружения

- `apps/api/src/environments/environment.ts` - development environment API
- `apps/api/src/environments/environment.prod.ts` - production environment API
- `apps/api/src/adapters/.env` - ключи и настройки AI-адаптеров для локального запуска
- `apps/web/proxy.conf.json` - proxy API + WebSocket на локальный backend

## Основные команды

```bash
# локальная разработка
npm start
npm run dev

# production-сборка всего приложения
npm run build

# локальная проверка собранного приложения
npm run preview

# линтинг
npm run lint

# проверка типов
npm run typecheck

# тесты
npm run test

# форматирование
npm run format
npm run format:check
```

## Production

- `npm run build` - сборка contracts + frontend + backend в `dist/public` и `dist/server.mjs`
- `node dist/server.mjs` - запуск через настройки адаптеров из environment процесса
- `node dist/server.mjs --adapters-env-file=/absolute/path/adapters.env` - запуск через внешний файл

## Структура проекта

```text
apps/
  web/
    src/
      app/
      pages/
      widgets/
      features/
      entities/
      shared/
  api/
    src/
      environments/
      prompts/
      chat/
      adapters/
      transports/
packages/
  contracts/
```
