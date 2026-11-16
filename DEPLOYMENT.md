# Dubas: Firebase Hosting и Cloudflare

Production: статические страницы на Firebase Spark, Worker `dubas-inquiries`, D1 `dubas-inquiries`, уведомления в личный Telegram. Биллинг Firebase и платный план Cloudflare не нужны. Квоты бесплатных планов ограничены; после их исчерпания сервис может перестать обслуживать запросы.

## Настройка аккаунтов один раз

1. Войти через `npx --no-install firebase login` и `npx --no-install wrangler login`. Для нового Google Cloud аккаунта принять условия в консоли, не подключая карту или trial.
2. Создать Firebase-проект без Analytics и биллинга. Создать Hosting site: последовательно пробовать `dubas`, `dubas-studio`, `dubas-web`. Это идентификатор сайта, он может отличаться от ID проекта. Команда: `npx --no-install firebase hosting:sites:create SITE_ID --project PROJECT_ID`.
3. D1 уже создана в аккаунте владельца: `0a27a88f-9e6b-4fb8-af61-c9a9e357f4bf`, регион WEUR. Не создавать вторую базу вместо неё.
4. Через @BotFather создать бота, открыть его чат и нажать Start. Токен вводить в секреты Cloudflare, не в исходники и не в GitHub Variables.
5. Создать сервисный аккаунт Google для GitHub, выдать `roles/firebasehosting.admin` и `roles/serviceusage.serviceUsageConsumer` только в выбранном проекте. Его JSON-ключ загрузить в GitHub Secret `FIREBASE_SERVICE_ACCOUNT`. Не выдавать Owner/Editor. Ключ не хранить в checkout. Помощник `node --env-file=.env.production.local scripts/connect-firebase-ci.mjs` выполняет эти операции через существующий вход Firebase CLI и сразу отправляет ключ в GitHub, не сохраняя его на диск. При уже существующем секрете он останавливается, чтобы не создавать лишние ключи.
6. Создать Cloudflare API token только для нужного аккаунта с Account / Workers Scripts / Edit и Account / D1 / Edit. При требовании CLI чтения аккаунта добавить Account Settings / Read. Загрузить в GitHub Secret `CLOUDFLARE_API_TOKEN`; OAuth-токен локального Wrangler для CI не подходит.

## GitHub Variables

Repository Settings → Secrets and variables → Actions → Variables:

| Переменная | Значение |
|---|---|
| `SITE_URL` | Итоговый `https://SITE_ID.web.app` |
| `INQUIRY_ENDPOINT` | `https://dubas-inquiries.SUBDOMAIN.workers.dev/api/inquiries` |
| `TELEGRAM_URL` | `https://t.me/DubaArts` |
| `PROVIDER_NAME` | Реальное имя исполнителя, публично |
| `PROVIDER_TAX_ID` | Реальный налоговый номер, публично |
| `FIREBASE_PROJECT_ID` | ID проекта Google/Firebase |
| `CLOUDFLARE_ACCOUNT_ID` | `9a7fbbb7b9e393c01ecc7718eb9750d7` |
| `CLOUDFLARE_D1_DATABASE_ID` | `0a27a88f-9e6b-4fb8-af61-c9a9e357f4bf` |
| `PRODUCTION_ENABLED` | Оставить `false` до готовности всех настроек; затем `true` |

Имя и налоговый номер попадут в общедоступную сборку. В Variables не добавлять токены, ключи или закрытые контакты.

## Локальная production-конфигурация

Скопировать `.env.example` в `.env.production.local`, заполнить настоящие значения. Скрипты Node запускаются с `--env-file=.env.production.local`; файл автоматически не читается отдельными Node-скриптами. Next.js при обычной сборке читает свои env-файлы сам.

```powershell
node --env-file=.env.production.local scripts/configure-deployment.mjs
npx --no-install wrangler d1 migrations apply DB --remote --config worker/wrangler.production.json
npx --no-install wrangler secret put TELEGRAM_BOT_TOKEN --config worker/wrangler.production.json
npx --no-install wrangler secret put TELEGRAM_CHAT_ID --config worker/wrangler.production.json
npx --no-install wrangler secret put IP_HASH_SECRET --config worker/wrangler.production.json
```

Вместо трёх отдельных команд `secret put` можно выполнить `npm run telegram:connect` в обычном локальном терминале. Помощник скрыто запросит токен, проверит созданного бота, найдёт Start из личного чата `@DubaArts` через официальный `getUpdates` и загрузит все три секрета в Cloudflare. Он также создаст независимый случайный `IP_HASH_SECRET`. Токен и ответы с перепиской не выводятся. Для повторного подключения потребуется новое сообщение Start, если старое уже недоступно в Bot API.

Созданный в Cloudflare dashboard scoped CI token можно безопасно загрузить в GitHub командой `npm run cloudflare:connect-ci`: скрытый ввод, проверка токена у Cloudflare, запись в GitHub Secret без передачи через аргументы процесса.

При ручной настройке `IP_HASH_SECRET` — независимая случайная строка минимум из 32 байтов. Приватный `chat_id` получить через Bot API `getUpdates` после Start; не использовать сторонних ботов для получения токена или доступа к переписке. Не печатать полные ответы Bot API или токены в общие журналы.

`worker/wrangler.production.json` генерируется локально и исключён из Git. Он содержит ID базы, точный разрешённый origin сайта и revision, но не секреты. Файл `worker/wrangler.jsonc` имеет фиктивный ID базы для локальных проверок; не публиковать его напрямую в production.

## Автоматическая публикация

Workflow `.github/workflows/production.yml`:

- PR: Node 24, `npm ci`, тесты SQL/Telegram с заглушкой, сборка с явно обозначенными CI-данными, проверка TypeScript, dry-run Worker. Production-секреты не выдаются.
- `main`, пока `PRODUCTION_ENABLED` не `true`: только проверки; фиктивная сборка не публикуется.
- `main` при `PRODUCTION_ENABLED=true`: сборка с реальными данными → проверки → совместимые миграции D1 → Worker → проверка `/health` и SHA → проверка артефакта → Firebase Hosting → проверки публичных страниц и 404.
- Повторный запуск — вкладка Actions → Check and deploy Dubas → Run workflow, ветка `main`.
- Публикации выполняются последовательно. Не отменять production-job посередине. Миграции должны быть добавочными и сохранять совместимость с предыдущим Worker.

GitHub CLI для загрузки workflow должен иметь OAuth scope `workflow`; при необходимости выполнить `gh auth refresh -h github.com -s workflow`.

## Заявки и доставка

`POST /api/inquiries`: прежний JSON формы. Заголовок `Idempotency-Key` — случайный UUID, сохраняемый браузером при повторе неизменённой формы. Успех: HTTP 201 и `{ "id": "...", "status": "saved" }`. Сохранение в D1 — условие успеха; доставка в Telegram выполняется после сохранения. Изменённые данные с прежним ключом дают 409, неверные поля 422, частые запросы 429, сбой БД 503.

Счётчики 8 попыток за 10 минут хранят только HMAC IP с серверным секретом. CORS не заменяет защиту от спама. Задание каждые 10 минут очищает просроченные записи и повторяет до 20 готовых уведомлений за запуск в течение суток. Учитывается Telegram `retry_after`. Подтверждённые части длинного сообщения повторно не отправляются. При потерянном ответе Telegram возможен повтор уже доставленной части; номер заявки позволяет распознать дубликат — Telegram не обеспечивает exactly-once отправку.

Рабочая база хранит заявки до 90 дней; очистка зависит от доступности Worker и квот. Копии сообщений Telegram и резервные копии провайдера имеют отдельный жизненный цикл.

После исправления конфигурации или доступности Telegram повторить неотправленную заявку:

```powershell
npm run inquiries:retry -- UUID_ЗАЯВКИ
```

Команда работает только с `failed`, пока запись не просрочена, возобновляет оставшиеся части и открывает новое суточное окно. Отправка произойдёт ближайшим заданием, сама команда не отправляет сообщений.

## Первый запуск и наблюдение

1. Проверить `npm test`, `npm run build:ci`, `npm run typecheck`, `npm run worker:check`.
2. Заполнить реальные GitHub Variables, секреты GitHub и Cloudflare; включить `PRODUCTION_ENABLED=true` и выполнить workflow.
3. Проверить с телефона и компьютера обе локали, вложенные страницы, меню, форму, ссылки, `robots.txt` и `sitemap.xml`. Затем отправить одну явно тестовую заявку с адресом `example.test` и проверить её ID в базе и Telegram.
4. Добавить итоговый URL в Google Search Console как URL-prefix property. Код HTML-верификации выдаёт Google; добавить соответствующий файл в публичную сборку и отправить `sitemap.xml`. Не обещать немедленного появления в поиске.
5. Следить за ошибками Actions, квотами Firebase/Cloudflare, статусами `pending`/`failed` в D1. `/health` проверяет схему и наличие секретов; он не проверяет действительность токена Telegram и не раскрывает заявки. Не публиковать административный HTTP API.

## Откат

- Сайт: Firebase Console → Hosting → предыдущий release → Roll back.
- Worker: `npx --no-install wrangler deployments list --config worker/wrangler.production.json`, затем `npx --no-install wrangler rollback VERSION_ID --config worker/wrangler.production.json`.
- После отката проверить сайт и API. D1 автоматически не откатывать: это может уничтожить новые заявки. Миграции исправлять совместимой следующей миграцией.
- Для возвращения к известному commit через CI использовать обычный `git revert` с проверками. Не переписывать историю `main`.
- Старая GitHub Pages версия остаётся тестовой с `noindex`, этот workflow её не обновляет.
