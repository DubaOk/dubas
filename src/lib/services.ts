import { copy, homePath, type Locale } from './content';

export const serviceIds = ['business-card', 'landing', 'multi-page', 'shop'] as const;
export type ServiceId = typeof serviceIds[number];
export type DevelopmentApproach = 'template' | 'custom';
export const servicePrices: Record<ServiceId, Record<DevelopmentApproach, number>> = {
  'business-card': { template: 450, custom: 1050 },
  landing: { template: 550, custom: 1050 },
  'multi-page': { template: 1050, custom: 1500 },
  shop: { template: 1050, custom: 1500 },
};
export const servicePath = (locale: Locale, id: ServiceId | string) => `${homePath(locale)}services/${id}/`;
export const serviceInfo = (locale: Locale, id: ServiceId) => copy[locale].services.find(service => service.id === id)!;
export const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

export const servicesCopy = {
  ru: {
    back: 'Все форматы', example: 'Посмотреть пример', discuss: 'Обсудить этот сайт',
    from: 'от', currency: 'BYN', currencyNote: 'Цены в белорусских рублях (BYN). Это начальная стоимость. Итог зависит от страниц, контента и интеграций. Домен, хостинг и платные лицензии согласуем отдельно.',
    exampleLabel: 'ПРИМЕР ФОРМАТА', exampleTitle: 'Посмотрите, как это работает.',
    exampleNote: 'Интерактивный дизайн-концепт вымышленного бренда. Показывает формат и возможности, а не готовый шаблон или выполненный заказ.',
    demoHint: 'Попробуйте меню и кнопки внутри примера.', demoNotice: 'Демонстрация: данные и заказы не отправляются.',
    includes: 'Что входит в стартовую стоимость', forWhom: 'Когда подойдёт', compare: 'Два подхода. Разный объём работы.',
    compareIntro: 'Выбираем вместе с вами: от адаптации готовой основы до структуры и дизайна с нуля.',
    approachLabel: 'Подход к разработке',
    approach: {
      template: { title: 'На основе шаблона', kicker: 'ГОТОВАЯ ОСНОВА', heading: 'Быстрый старт. Ваш бренд.', text: 'Берём готовую композицию и адаптируем цвета, шрифты, изображения и содержание. Подходит, когда задачи укладываются в проверенную структуру.', facts: ['Готовая структура', 'Адаптация под бренд', 'Меньше работы с нуля'], reason: 'Вы оплачиваете подбор и адаптацию готовой основы. Перестройку шаблона и дополнительные функции оцениваем отдельно.' },
      custom: { title: 'Индивидуальная разработка', kicker: 'С ЧИСТОГО ЛИСТА', heading: 'Ваша задача задаёт форму.', text: 'Проектируем путь посетителя, структуру и визуальный стиль под ваш бизнес. Согласуем макеты до разработки и создаём нужные взаимодействия.', facts: ['Структура с нуля', 'Дизайн под задачу', 'Согласование макетов'], reason: 'В стоимость добавляются проектирование, авторские макеты и их реализация. Больше свободы в композиции и пользовательских сценариях.' },
    },
    formats: {
      'business-card': { headline: 'Всё о вас. В одном месте.', audience: 'Специалисту или небольшому бизнесу, которому нужен понятный сайт с услугами, работами и контактами.', template: { text: 'Аккуратная готовая композиция: представление, услуги, примеры работ и контакты. Наполняем вашими материалами и оформляем под бренд.', items: ['Адаптация готовой композиции', 'Услуги, работы и контакты', 'Мобильная версия и базовое SEO'] }, custom: { text: 'Проектируем личную подачу: от структуры знакомства до авторской типографики, галереи и способа связи.', items: ['Индивидуальная структура страницы', 'Авторский дизайн и макеты', 'Адаптивная разработка и базовое SEO'] } },
      landing: { headline: 'Одно предложение. Ясный следующий шаг.', audience: 'Для запуска продукта, услуги, курса или события, когда нужно последовательно раскрыть предложение и получить обращение.', template: { text: 'Готовая логика страницы для одного предложения. Адаптируем блоки, добавляем материалы и форму обращения.', items: ['Адаптация готовых блоков', 'Продукт, преимущества и форма', 'Мобильная версия и базовое SEO'] }, custom: { text: 'Собираем историю продукта с нуля: продумываем аргументы, порядок блоков, акценты и путь к заявке.', items: ['Сценарий страницы под продукт', 'Индивидуальный дизайн блоков', 'Адаптивная разработка и форма заявки'] } },
      'multi-page': { headline: 'Больше направлений. Одна понятная система.', audience: 'Компании с несколькими услугами, проектами и большим объёмом информации, которую важно разложить по разделам.', template: { text: 'Разворачиваем готовую систему страниц. Настраиваем навигацию и оформляем услуги, проекты и информацию о компании.', items: ['Адаптация типовых страниц', 'Навигация и структура разделов', 'Адаптивность и базовое SEO'] }, custom: { text: 'Проектируем архитектуру сайта и отдельные сценарии для услуг, проектов и информации о компании. Создаём общий визуальный язык.', items: ['Архитектура сайта под бизнес', 'Авторские макеты ключевых страниц', 'Адаптивная разработка и базовое SEO'] } },
      shop: { headline: 'От первого взгляда до корзины.', audience: 'Для продажи товаров через каталог с карточками, корзиной и оформлением заказа.', template: { text: 'Адаптируем готовую витрину, каталог и карточки товаров. Настраиваем корзину и базовое оформление заказа.', items: ['Адаптация каталога и карточек', 'Корзина и оформление заказа', 'Мобильная версия магазина'] }, custom: { text: 'Проектируем витрину и путь покупателя под ваш ассортимент. Создаём собственную композицию каталога, карточек и корзины.', items: ['Сценарий покупки под ассортимент', 'Индивидуальный дизайн магазина', 'Каталог, корзина и оформление заказа'] } },
    },
  },
  en: {
    back: 'All website formats', example: 'Explore the example', discuss: 'Discuss this website', from: 'from', currency: 'BYN',
    currencyNote: 'Starting prices in Belarusian rubles (BYN). Final pricing depends on pages, content and integrations. Domain, hosting and paid licences are agreed separately.',
    exampleLabel: 'WEBSITE FORMAT EXAMPLE', exampleTitle: 'See the format in action.', exampleNote: 'An interactive design concept for a fictional brand. It illustrates the format and possibilities, rather than an available template or a commissioned project.',
    demoHint: 'Try the navigation and buttons inside the example.', demoNotice: 'Demo only: no data or orders are submitted.',
    includes: 'Included in the starting price', forWhom: 'A good fit for', compare: 'Two approaches. Different scopes.', compareIntro: 'We help you choose: adapt an existing foundation or design the structure and visuals from scratch.', approachLabel: 'Development approach',
    approach: {
      template: { title: 'Template-based', kicker: 'EXISTING FOUNDATION', heading: 'A quick start. Your brand.', text: 'We adapt an existing composition with your colours, fonts, imagery and content. A good fit when proven page structures cover your needs.', facts: ['Existing structure', 'Tailored branding', 'Less work from scratch'], reason: 'You pay for selecting and adapting an existing foundation. Structural changes and extra features are estimated separately.' },
      custom: { title: 'Custom development', kicker: 'FROM A BLANK PAGE', heading: 'Your brief shapes the website.', text: 'We plan the visitor journey, page structure and visual style for your business. Layouts are agreed before development, with interactions designed for your needs.', facts: ['Structure from scratch', 'Original design', 'Layouts agreed first'], reason: 'The price includes planning, original layouts and their implementation, with more freedom in composition and user journeys.' },
    },
    formats: {
      'business-card': { headline: 'Everything about you. In one place.', audience: 'For a specialist or small business that needs a clear introduction, services, selected work and contact details.', template: { text: 'An established composition with an introduction, services, work and contacts, filled with your content and adapted to your brand.', items: ['Adapt an existing composition', 'Services, work and contact details', 'Responsive layout and basic SEO'] }, custom: { text: 'A personal presentation planned around your story, with original typography, work galleries and contact options.', items: ['Individual page structure', 'Original design and layouts', 'Responsive development and basic SEO'] } },
      landing: { headline: 'One offer. A clear next step.', audience: 'For launching a product, service, course or event with a focused page that explains the offer and invites enquiries.', template: { text: 'A proven page structure for a single offer. We adapt its sections, add your content and an enquiry form.', items: ['Adapt existing page sections', 'Offer, benefits and enquiry form', 'Responsive layout and basic SEO'] }, custom: { text: 'We shape the product story from scratch, planning its arguments, section order, visual emphasis and enquiry journey.', items: ['A page journey for your product', 'Original section designs', 'Responsive development and enquiry form'] } },
      'multi-page': { headline: 'More services. One clear system.', audience: 'For a company with several services, projects and information that deserves its own pages and navigation.', template: { text: 'An existing page system adapted for your services, projects and company information, with clear navigation.', items: ['Adapt standard page layouts', 'Navigation and section structure', 'Responsive layout and basic SEO'] }, custom: { text: 'A website architecture and visual language developed for your services, projects and company story.', items: ['Architecture for your business', 'Original layouts for key pages', 'Responsive development and basic SEO'] } },
      shop: { headline: 'From the first look to the basket.', audience: 'For selling products through a catalogue, product pages, a basket and checkout.', template: { text: 'An existing storefront adapted for your catalogue and products, with a basket and a basic checkout flow.', items: ['Adapt catalogue and product pages', 'Basket and checkout', 'Responsive shop layout'] }, custom: { text: 'A storefront and shopping journey planned around your range, with original catalogue, product and basket layouts.', items: ['A journey for your product range', 'Original shop design', 'Catalogue, basket and checkout'] } },
    },
  },
} as const;
