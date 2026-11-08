export type Locale = 'ru' | 'en';
export type ProjectId = 'marta' | 'forma' | 'daily';

export const site = {
  name: 'NODRA',
  telegram: null as string | null,
  email: null as string | null,
  providerName: null as string | null,
  providerTaxId: null as string | null,
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || null,
};

export const homePath = (locale: Locale) => locale === 'ru' ? '/' : '/en/';
export const workPath = (locale: Locale, slug: string) => `${homePath(locale)}work/${slug}/`;
export const privacyPath = (locale: Locale) => `${homePath(locale)}privacy/`;

export const copy = {
  ru: {
    skip: 'К содержимому', menu: 'Меню', close: 'Закрыть меню',
    nav: ['Услуги', 'Работы', 'Процесс'], talk: 'Обсудить проект',
    eyebrow: 'НЕЗАВИСИМАЯ ВЕБ-СТУДИЯ', hero: ['Сайты', 'с характером.'],
    intro: 'Проектируем и разрабатываем сайты для бизнеса. От первой идеи до готовой страницы в интернете.',
    viewWork: 'Смотреть работы', heroNote: 'От сайта-визитки до интернет-магазина',
    orbit: 'ХОРОШИЕ ИДЕИ ПОЛУЧАЮТ СВОЙ САЙТ',
    strip: ['Индивидуальный дизайн', 'Адаптация под устройства', 'Разработка на Next.js', 'Исходники у вас'],
    servicesLabel: '01 / ЧТО ДЕЛАЕМ', servicesTitle: 'Ваша задача.\nПодходящий формат.',
    servicesIntro: 'Четыре типа сайтов. Любой можно разработать на основе шаблона или спроектировать индивидуально под вашу задачу.',
    approachLabelShort: 'Подход к разработке', estimateProject: 'Оценить проект',
    development: {
      template: { title: 'На основе шаблона', text: 'Подбираем готовую основу и адаптируем её под ваш бренд, материалы и функции. Лицензию и стоимость шаблона согласуем до начала работы.' },
      custom: { title: 'Индивидуальная разработка', text: 'Проектируем структуру, дизайн и функции под ваш бизнес. Сначала согласуем макеты, затем разрабатываем сайт.' },
    },
    services: [
      { id: 'shop', title: 'Интернет-магазин', note: 'Для продажи товаров', text: 'Каталог, карточки товаров, корзина и оформление заказа. Оплату, доставку и учёт товаров подключаем по согласованному списку интеграций.', items: ['Каталог и поиск товаров', 'Корзина и оформление заказа', 'Интеграции по задаче'] },
      { id: 'business-card', title: 'Сайт-визитка', note: 'Чтобы познакомиться с вами', text: 'Компактный сайт специалиста или небольшого бизнеса. Собираем услуги, примеры работ и контакты в понятную структуру.', items: ['Информация о вас и услугах', 'Работы и контакты', 'Удобный просмотр с телефона'] },
      { id: 'landing', title: 'Лендинг', note: 'Для одного продукта или предложения', text: 'Страница услуги, продукта или события. Объясняем предложение, отвечаем на вопросы и добавляем форму заявки.', items: ['Последовательность блоков', 'Описание предложения', 'Форма обращения'] },
      { id: 'multi-page', title: 'Многостраничный сайт', note: 'Для компании с несколькими направлениями', text: 'Отдельные страницы услуг, проектов и информации о компании. Продумываем навигацию и готовим страницы к поиску.', items: ['Структура и навигация', 'Страницы услуг и проектов', 'Базовая SEO-подготовка'] },
    ],
    included: 'В каждом проекте', includedText: 'Адаптация под устройства, проверка в браузерах, настройка заголовков и метаданных. Передаём код и инструкцию. Условия использования сторонних шаблонов и компонентов согласуем отдельно.',
    workLabel: '02 / ИЗБРАННЫЕ РАБОТЫ', workTitle: 'Реальный запуск.\nНовые концепты.',
    workIntro: 'Здесь собраны запущенный сайт и авторские дизайн-концепты. У каждого проекта указаны статус и выполненные работы.',
    real: 'Реальный проект', concept: 'Концепт', case: 'О проекте',
    approachLabel: '03 / ПОДХОД', approachTitle: 'Что вы получите\nвместе с сайтом.',
    approach: [
      { title: 'Дизайн под содержание', text: 'Начинаем с задачи и материалов. Определяем, что посетителю нужно узнать и какое действие совершить.' },
      { title: 'Удобно с телефона', text: 'Продумываем мобильную версию вместе с десктопной. Проверяем меню, размеры текста и кнопок.' },
      { title: 'Понятный ход работы', text: 'Согласуем этапы и состав проекта до начала разработки. Показываем промежуточный результат.' },
      { title: 'Проект остаётся у вас', text: 'Передаём код, файлы и инструкцию. Домен и хостинг можно оформить на ваше имя.' },
    ],
    pricingLabel: 'СТОИМОСТЬ', pricingTitle: 'Сначала задача.\nЗатем оценка.',
    pricingText: 'Цена зависит от количества страниц, готовности материалов и нужных функций. Обсудим задачу и подготовим предложение с составом работ.',
    pricingNote: 'Объём, стоимость и порядок оплаты согласуем до старта.',
    processLabel: '04 / КАК РАБОТАЕМ', processTitle: 'От разговора\nдо запуска.',
    process: [
      { title: 'Знакомимся', text: 'Обсуждаем бизнес, аудиторию, задачи сайта и ваши материалы.' },
      { title: 'Собираем структуру', text: 'Определяем страницы, блоки и путь посетителя.' },
      { title: 'Делаем дизайн', text: 'Согласуем оформление и макеты основных экранов.' },
      { title: 'Разрабатываем', text: 'Пишем код, адаптируем страницы и подключаем согласованные функции.' },
      { title: 'Проверяем и запускаем', text: 'Тестируем сайт, размещаем его и передаём исходники.' },
    ],
    faqLabel: '05 / ЕСТЬ ВОПРОС', faqTitle: 'Разберёмся\nдо начала работы.',
    faq: [
      ['Сколько стоит сайт?', 'Стоимость зависит от типа сайта, выбранного подхода, числа страниц и интеграций. Для разработки на основе шаблона отдельно учитываем его лицензию. После обсуждения задачи согласуем состав работ и цену.'],
      ['Чем шаблон отличается от индивидуальной разработки?', 'В первом случае берём готовую основу и адаптируем её под ваш бренд и содержание. При индивидуальной разработке проектируем структуру и дизайн с нуля. Подход выбираем с учётом задачи, бюджета и нужных функций.'],
      ['Какие сроки разработки?', 'Срок определяем после знакомства с задачей. Учитываем объём сайта, подготовку материалов и время на согласование макетов. Фиксируем график перед стартом.'],
      ['Как проходит оплата?', 'Порядок и этапы оплаты согласуем до начала проекта. Исполнитель работает как плательщик НПД и формирует чеки в приложении по полученным доходам.'],
      ['Домен и хостинг входят в стоимость?', 'Домен и хостинг оплачиваются отдельно, если иное не согласовано в предложении. Поможем подготовить сайт к выбранному размещению. Владельцем домена остаётесь вы.'],
      ['Можно ли доработать сайт после запуска?', 'Да. Исправления в рамках согласованной задачи и новые функции обсуждаем отдельно. Условия поддержки фиксируем в предложении.'],
      ['Получим ли мы исходники?', 'Да. Передаём код и инструкцию по работе с сайтом. Сторонние шаблоны, шрифты и компоненты используются на условиях их лицензий. Эти условия согласуем до покупки и начала разработки.'],
    ],
    contactLabel: 'ЕСТЬ ИДЕЯ?', contactTitle: 'Давайте сделаем\nваш сайт.',
    contactText: 'Для начала достаточно рассказать, чем вы занимаетесь и что хотите получить. Можно приложить примеры сайтов, которые вам нравятся.',
    contactPending: 'Контакты скоро появятся', telegramPending: 'Telegram пока не указан', emailPending: 'Email пока не указан',
    contactDraft: 'Локальная версия. Приём обращений ещё не подключён.',
    footer: 'Дизайн и разработка сайтов', location: 'Беларусь · Работаем удалённо', privacy: 'Конфиденциальность',
    provider: 'Исполнитель: физическое лицо, плательщик НПД. Имя и реквизиты будут добавлены до публикации.',
    back: 'Все работы', projectTask: 'Задача', projectSolution: 'Что сделано', projectDetails: 'О проекте', projectRole: 'Роль', projectFormat: 'Формат',
    visit: 'Открыть сайт', nextProject: 'Следующий проект', conceptNotice: 'Авторский дизайн-концепт. Это демонстрационная работа для вымышленного бренда, а не выполненный заказ.',
    realNotice: 'Запущенный проект. Дизайн, разработка, подключение оплаты и запуск выполнены автором NODRA.',
    privacyTitle: 'Конфиденциальность', privacyIntro: 'Как устроена обработка данных в текущей версии NODRA.',
    privacySections: [
      ['Форма заявки', 'Для предварительной оценки и обратной связи форма запрашивает имя, телефон или email, описание задачи и согласие на обработку данных. По желанию можно выбрать тип сайта и подход к разработке. Не указывайте паспортные, платёжные, медицинские и другие сведения, которые не нужны для оценки сайта.'],
      ['Сохранение и срок хранения', 'В текущей локальной версии заявки сохраняются на сервере в папке вне публичных файлов сайта. Сохраняются поля формы, время отправки, версия согласия и срок хранения до 90 дней. Просроченные заявки удаляются при запуске сервера, при новой записи и во время ежедневной проверки работающего сервера. Настройки браузера и данные формы не сохраняются в cookies или localStorage.'],
      ['Защита от повторных отправок', 'Сервер временно использует IP-адрес для ограничения частых запросов. Счётчики хранятся в оперативной памяти до 10 минут; IP-адрес не включается в файл заявки. Сайт не подключает аналитику, рекламные пиксели или сторонние сервисы приёма заявок. Шрифты и изображения размещены локально.'],
      ['Передача и обращения по данным', 'Уведомления в Telegram и по email пока не подключены. Заявки не пересылаются в эти сервисы. До публикации здесь будут указаны имя оператора, его контакт для обращений и порядок отзыва согласия, доступа к данным, исправления и удаления. При подключении хостинга или Telegram-бота описание обработки и получателей будет обновлено.'],
      ['Технические сведения', 'Программа локального просмотра может обрабатывать технические запросы браузера. После выбора хостинга этот раздел будет уточнён с учётом журналов сервера и условий провайдера. Отсутствие формы само по себе не означает отсутствия обработки персональных данных.'],
      ['Перед публикацией', 'Имя исполнителя, реквизиты и контакт по вопросам данных ещё не заполнены. Настоящее описание относится только к текущей локальной версии и должно быть обновлено перед запуском публичного сайта.'],
    ],
    notFound: 'Такой страницы нет', notFoundText: 'Возможно, адрес изменился. Все услуги и работы есть на главной.', home: 'На главную',
  },
  en: {
    skip: 'Skip to content', menu: 'Menu', close: 'Close menu',
    nav: ['Services', 'Work', 'Process'], talk: 'Discuss a project',
    eyebrow: 'INDEPENDENT WEB STUDIO', hero: ['Websites', 'with character.'],
    intro: 'We design and build websites for businesses. From an early idea to a finished website, ready to go online.',
    viewWork: 'Explore our work', heroNote: 'Business websites, landing pages and online shops',
    orbit: 'GOOD IDEAS DESERVE A WEBSITE',
    strip: ['Custom design', 'Responsive layouts', 'Built with Next.js', 'Source code included'],
    servicesLabel: '01 / WHAT WE DO', servicesTitle: 'Your brief.\nThe right format.',
    servicesIntro: 'Four website formats. Each can use a tailored template or be designed and built around your brief.',
    approachLabelShort: 'Development approach', estimateProject: 'Request an estimate',
    development: {
      template: { title: 'Template-based', text: 'We select an existing template and adapt it to your brand, content and features. We agree on the template licence and cost before starting.' },
      custom: { title: 'Custom development', text: 'We plan the structure, design and features around your business. We agree on the layouts before development.' },
    },
    services: [
      { id: 'shop', title: 'Online shop', note: 'For selling products', text: 'A catalogue, product pages, basket and checkout. We add payment, delivery and stock integrations according to an agreed list.', items: ['Product catalogue and search', 'Basket and checkout', 'Agreed integrations'] },
      { id: 'business-card', title: 'Business card website', note: 'An introduction to your business', text: 'A compact website for a specialist or small business. We organise your services, work and contact details in a clear structure.', items: ['Your business and services', 'Work and contact details', 'Responsive layouts'] },
      { id: 'landing', title: 'Landing page', note: 'For one product or offer', text: 'A page for a service, product or event. We explain the offer, answer common questions and add an enquiry form.', items: ['Page structure', 'Offer and product information', 'Enquiry form'] },
      { id: 'multi-page', title: 'Multi-page website', note: 'For a business with several services', text: 'Separate pages for services, projects and company information. We plan the navigation and prepare the pages for search.', items: ['Site structure and navigation', 'Service and project pages', 'Basic technical SEO'] },
    ],
    included: 'Included in every project', includedText: 'Responsive layouts, browser checks, page titles and metadata. We hand over the code and instructions. Terms for third-party templates and components are agreed separately.',
    workLabel: '02 / SELECTED WORK', workTitle: 'A live website.\nTwo new concepts.',
    workIntro: 'A live website and original design concepts. Each project states its status and the work carried out.',
    real: 'Live project', concept: 'Concept', case: 'View project',
    approachLabel: '03 / OUR APPROACH', approachTitle: 'What comes\nwith your website.',
    approach: [
      { title: 'Design follows the content', text: 'We start with your brief and materials. We decide what visitors need to learn and what they should do next.' },
      { title: 'Made for mobile, too', text: 'We plan mobile and desktop layouts together, checking menus, text sizes and touch targets.' },
      { title: 'A process you can follow', text: 'We agree on the stages and deliverables before development. You see the work as it takes shape.' },
      { title: 'You keep the project', text: 'We hand over the code, files and instructions. Your domain and hosting can be registered in your name.' },
    ],
    pricingLabel: 'PRICING', pricingTitle: 'First, the brief.\nThen, the estimate.',
    pricingText: 'The price depends on the page count, available content and required features. We discuss your brief and send a proposal listing the work.',
    pricingNote: 'Scope, price and payment terms are agreed before work begins.',
    processLabel: '04 / THE PROCESS', processTitle: 'From a conversation\nto a live website.',
    process: [
      { title: 'Get acquainted', text: 'We discuss your business, audience, website goals and existing materials.' },
      { title: 'Plan the structure', text: 'We map the pages, sections and visitor journey.' },
      { title: 'Design the pages', text: 'We agree on the visual direction and main page layouts.' },
      { title: 'Build the website', text: 'We write the code, adapt the layouts and add the agreed features.' },
      { title: 'Check and launch', text: 'We test the website, put it online and hand over the source code.' },
    ],
    faqLabel: '05 / QUESTIONS', faqTitle: 'Let\'s clear things up\nbefore we start.',
    faq: [
      ['How much does a website cost?', 'The website format, development approach, page count and integrations affect the price. For template-based work, we also account for the template licence. We agree on scope and price after discussing the brief.'],
      ['How do templates and custom development differ?', 'With a template, we adapt an existing foundation to your brand and content. With custom development, we plan the structure and design from scratch. The choice depends on your brief, budget and required features.'],
      ['How long does development take?', 'We set a schedule after reviewing the brief. It accounts for website size, content preparation and design approvals. We agree on the timeline before work begins.'],
      ['How do payments work?', 'We agree on payment terms and milestones before starting. The provider is a Belarusian professional income tax payer and issues receipts through the tax application for income received.'],
      ['Are hosting and a domain included?', 'Domain registration and hosting are paid separately unless the proposal states otherwise. We help prepare the website for your chosen hosting. You retain ownership of your domain.'],
      ['Can we add features after launch?', 'Yes. Changes to the agreed scope and new features are discussed separately. Support terms are listed in the proposal.'],
      ['Do we receive the source code?', 'Yes. We hand over the code and instructions. Third-party templates, fonts and components remain subject to their licences. We agree on those terms before purchase and development.'],
    ],
    contactLabel: 'HAVE AN IDEA?', contactTitle: 'Let\'s build\nyour website.',
    contactText: 'Start with what your business does and what you need from the website. Feel free to include examples you like.',
    contactPending: 'Contact details coming soon', telegramPending: 'Telegram is not set yet', emailPending: 'Email is not set yet',
    contactDraft: 'Local preview. Contact channels are not connected yet.',
    footer: 'Website design and development', location: 'Belarus · Working remotely', privacy: 'Privacy',
    provider: 'Provider: an individual paying Belarusian professional income tax. The name and provider details will be added before publication.',
    back: 'All projects', projectTask: 'The brief', projectSolution: 'What we did', projectDetails: 'About the project', projectRole: 'Role', projectFormat: 'Format',
    visit: 'Visit website', nextProject: 'Next project', conceptNotice: 'An original design concept for a fictional brand. This is a demonstration project, not a client commission.',
    realNotice: 'A launched website. The NODRA founder handled design, development, payment integration and launch.',
    privacyTitle: 'Privacy', privacyIntro: 'How the current version of NODRA handles data.',
    privacySections: [
      ['Enquiry form', 'The form requests your name, phone or email, project description and data-processing consent for an estimate and follow-up. Website type and development approach are optional. Do not include identity documents, payment information, medical details or other information unnecessary for a website estimate.'],
      ['Storage and retention', 'In this local version, enquiries are stored on the server outside the public website files. Records include the form fields, submission time, consent version and an expiry date of up to 90 days. Expired records are removed on server startup, when saving a new record and during a daily check while the server is running. The website does not store form details in cookies or localStorage.'],
      ['Protection against repeated requests', 'The server temporarily uses IP addresses to limit repeated submissions. Counters remain in memory for up to 10 minutes; IP addresses are not included in saved enquiries. There are no analytics, advertising pixels or external form services. Fonts and images are hosted locally.'],
      ['Transfers and data requests', 'Telegram and email notifications are not connected. Enquiries are not forwarded to those services. Before publication, this page will name the operator and data contact and explain how to withdraw consent, access, correct or delete data. Hosting or Telegram bot integrations will require an update to the processing and recipient details.'],
      ['Technical information', 'The local preview software may process technical browser requests. After hosting is selected, this section will be updated to account for server logs and provider terms. A website without forms may still involve personal data processing.'],
      ['Before publication', 'The provider\'s name, details and data contact have not been filled in. This description applies only to the current local preview and must be updated before the website goes public.'],
    ],
    notFound: 'This page is missing', notFoundText: 'The address may have changed. You can find our services and work on the homepage.', home: 'Back to home',
  },
} as const;

type ProjectText = {
  title: string; category: string; summary: string; description: string;
  task: string; role: string; format: string; solution: readonly string[];
};
export type Project = {
  id: ProjectId; slug: string; kind: 'live' | 'concept'; url?: string;
  image: string; imageAlt: Record<Locale, string>; text: Record<Locale, ProjectText>;
};

export const projects: readonly Project[] = [
  {
    id: 'marta', slug: 'marta-marafon', kind: 'live', url: 'https://martamarafon.by/',
    image: '/images/marta-hero.jpg',
    imageAlt: { ru: 'Марта, автор марафона по домашнему пилатесу', en: 'Marta, the creator of the home Pilates programme' },
    text: {
      ru: { title: 'Пилатес с Мартой', category: 'Спорт и образование', summary: 'Лендинг онлайн-марафона с подключённой оплатой.', description: 'Сайт авторского марафона по домашнему пилатесу. Знакомит с тренером, рассказывает о программе и даёт возможность перейти к оплате участия.', task: 'Собрать в одном месте информацию о марафоне и организовать путь от знакомства с программой до оплаты участия.', role: 'Дизайн, разработка, интеграция оплаты, запуск', format: 'Лендинг и страница оплаты', solution: ['Разработаны оформление и адаптивная вёрстка.', 'На странице собраны история автора, материалы о тренировках и фотографии.', 'Подключён переход к оплате участия в марафоне.', 'Сайт размещён на собственном домене martamarafon.by.'] },
      en: { title: 'Pilates with Marta', category: 'Fitness and education', summary: 'A landing page for an online programme with payment integration.', description: 'A website for a home Pilates programme. It introduces the trainer, explains the programme and lets visitors proceed to payment.', task: 'Bring the programme information together and create a path from discovering the course to paying for participation.', role: 'Design, development, payment integration, launch', format: 'Landing page and checkout page', solution: ['Designed and developed responsive layouts.', 'Organised the trainer\'s story, training information and photographs.', 'Integrated the path to payment for the programme.', 'Launched the website on martamarafon.by.'] },
    },
  },
  {
    id: 'forma', slug: 'forma-interiors', kind: 'concept', image: '/images/interior.jpg',
    imageAlt: { ru: 'Светлый интерьер с деревянной мебелью и мягкими натуральными оттенками', en: 'A bright interior with wooden furniture and soft natural colours' },
    text: {
      ru: { title: 'FORMA interiors', category: 'Архитектура и интерьер', summary: 'Концепт сайта интерьерной студии с акцентом на проекты.', description: 'Демонстрационный сайт для вымышленной интерьерной студии. Крупные фотографии, спокойные цвета и редакционная типографика отдают главное место интерьерам.', task: 'Показать, как интерьерная студия может представить свои проекты и объяснить формат сотрудничества.', role: 'Арт-дирекция и дизайн-концепт', format: 'Концепт многостраничного сайта', solution: ['Разработана визуальная концепция в тёплых нейтральных цветах.', 'Спроектирована главная страница с крупными фотографиями.', 'Предложена структура портфолио и описания услуг.', 'Подготовлены настольное и мобильное представления.'] },
      en: { title: 'FORMA interiors', category: 'Architecture and interiors', summary: 'A website concept for an interior studio, centred on its work.', description: 'A demonstration website for a fictional interior studio. Large photographs, quiet colours and editorial typography make the interiors the focus.', task: 'Explore how an interior studio could present its projects and explain how to work with it.', role: 'Art direction and design concept', format: 'Multi-page website concept', solution: ['Created a visual direction with warm, neutral colours.', 'Designed a homepage built around large photographs.', 'Proposed a structure for the portfolio and services.', 'Prepared desktop and mobile compositions.'] },
    },
  },
  {
    id: 'daily', slug: 'daily-coffee', kind: 'concept', image: '/images/coffee.jpg',
    imageAlt: { ru: 'Кофейные зёрна крупным планом', en: 'A close-up of roasted coffee beans' },
    text: {
      ru: { title: 'DAILY coffee', category: 'Кофе и город', summary: 'Концепт сайта кофейни с собственным визуальным языком.', description: 'Демонстрационный проект для вымышленной городской кофейни. Контрастная типографика, кофейные оттенки и простые иллюстрации задают оформление.', task: 'Сделать компактный сайт, на котором можно познакомиться с кофейней и её меню.', role: 'Визуальная концепция и дизайн', format: 'Концепт лендинга', solution: ['Создана графическая концепция с авторской типографической композицией.', 'Спроектирован первый экран с фотографией кофе.', 'Предложены блоки меню, истории и контактов.', 'Подготовлено оформление для мобильных экранов.'] },
      en: { title: 'DAILY coffee', category: 'Coffee and city life', summary: 'A café website concept with its own visual language.', description: 'A demonstration project for a fictional neighbourhood café. Bold typography, coffee tones and simple illustrations define the design.', task: 'Create a compact website where visitors can discover the café and its menu.', role: 'Visual direction and design', format: 'Landing page concept', solution: ['Created a graphic direction with an original typographic composition.', 'Designed a hero section with coffee photography.', 'Proposed menu, story and contact sections.', 'Prepared the layout for mobile screens.'] },
    },
  },
];
