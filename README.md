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

- `config` - конфигурация API
- `prompts` - системные prompts для разных семейств моделей
- `chat` - обработка запросов и общая логика чата
- `adapters` - интеграции с AI-провайдерами
- `transports` - HTTP и Socket.IO-интерфейсы

#### Adapters

Adapters подключают backend к AI-провайдерам. Пока добавлен только adapter для Timeweb Cloud AI.

Для настройки Timeweb:

- скопируйте `apps/api/src/adapters/timeweb/.env.example` в
  `apps/api/src/adapters/timeweb/.env`
- положите API key в `TIMEWEB_API_KEY`
- положите ID агентов в переменные вида `TIMEWEB_AGENT_*_ID`, например в
  `TIMEWEB_AGENT_GPT_5_1_ID`

При запросе adapter использует agent ID выбранной модели. API key и agent ID хранятся только на
backend.

### Contracts

`@ai-chat/contracts` содержит список AI-моделей и структуры данных, которые одновременно нужны
frontend и backend. Пакет вынесен отдельно, чтобы клиент и сервер использовали один контракт.

## Минимальные требования

- `Node.js 20+`
- `npm 10+`

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

Зависимости всех workspaces устанавливаются из корня проекта.

### 2. Настройка backend

Создайте общий файл конфигурации:

- `apps/api/.env.example` → `apps/api/.env`

В нём настраиваются режим запуска, порт API и адрес frontend. Timeweb настраивается отдельно в
разделе `Adapters`.

### 3. Запуск в локальном окружении

```bash
npm run dev
```

После запуска frontend доступен по адресу `http://localhost:4200`, backend - по адресу
`http://localhost:5000`.

## Основные команды

```bash
# локальная разработка
npm run dev

# production-сборка всего приложения
npm run build

# запуск собранного приложения
npm start

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

## Конфигурация окружений

- `apps/api/.env` - режим запуска, порт API и адрес frontend
- `apps/web/proxy.conf.json` - proxy API + WebSocket на локальный backend

В production настройки backend задаются через environment variables платформы. Конфигурация
AI-провайдеров описана в блоке `Adapters`.

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
      config/
      prompts/
      chat/
      adapters/
      transports/
packages/
  contracts/
```

## Production

- `npm run build` - сборка contracts + frontend + backend в `dist`
- `npm start` - запуск API + Socket.IO + Angular-приложения одним Node.js server
