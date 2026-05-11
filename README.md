# Yandex Archive Downloader

Расширение Chrome для страниц поиска Яндекс Архива.

## Что умеет

- Кнопка скачивания оригинала на каждой карточке результата.
- Кнопка `Скачать все` рядом с контролом сортировки.
- Настройки в popup с мгновенным применением без перезагрузки страницы.
- Сохранение настроек в `chrome.storage.sync`.

## Технологии

- TypeScript
- React 18
- Chrome Extension Manifest V3
- esbuild
- ESLint + Prettier + Stylelint

## Структура проекта

- `src/content` — content script и встраивание UI на страницу.
- `src/background` — service worker и `chrome.downloads`.
- `src/popup` — popup-интерфейс на React.
- `src/features` — фичи и модель настроек.
- `src/shared` — общие конфиги и иконки.
- `assets/icons` — иконки расширения.

## Локальная разработка

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Установка в Chrome

1. Открой `chrome://extensions`.
2. Включи `Developer mode`.
3. Нажми `Load unpacked`.
4. Выбери папку проекта.

## Контрибьюторы

Список контрибьюторов хранится в [CONTRIBUTORS.md](./CONTRIBUTORS.md) и генерируется из git-истории:

```bash
npm run contributors
```

## Лицензия

MIT — см. [LICENSE](./LICENSE).
