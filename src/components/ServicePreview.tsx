'use client';

import { useState, type ReactNode } from 'react';
import { BelarusianRuble } from './BelarusianRuble';
import { publicPath } from '@/lib/deployment';
import { type Locale } from '@/lib/content';
import { type DevelopmentApproach, type ServiceId } from '@/lib/services';
import styles from './ServicePreview.module.css';

function Control({ interactive, onClick, children, className, label }: { interactive: boolean; onClick: () => void; children: ReactNode; className?: string; label?: string }) {
  return interactive ? <button type="button" className={className} onClick={onClick} aria-label={label}>{children}</button> : <span className={className}>{children}</span>;
}

export function ServicePreview({ id, approach, locale, interactive = false }: { id: ServiceId; approach: DevelopmentApproach; locale: Locale; interactive?: boolean }) {
  const ru = locale === 'ru';
  const [view, setView] = useState(0);
  const [cart, setCart] = useState([0, 0, 0]);
  const [checkout, setCheckout] = useState(false);
  const [message, setMessage] = useState('');
  const count = cart.reduce((sum, value) => sum + value, 0);
  const names = ru ? ['Утренний', 'Ягодный', 'Вечерний'] : ['Morning', 'Berry', 'Evening'];
  const prices = [28, 32, 30];
  const brand = id === 'shop' ? 'roast.' : id === 'landing' ? 'mellow.' : id === 'business-card' ? 'anna.' : 'forma';
  const nav = id === 'shop' ? (ru ? ['Каталог', 'О кофе', `Корзина (${count})`] : ['Shop', 'Our coffee', `Basket (${count})`]) : id === 'multi-page' ? (ru ? ['Проекты', 'Студия', 'Контакты'] : ['Projects', 'Studio', 'Contact']) : id === 'business-card' ? (ru ? ['Обо мне', 'Услуги', 'Связаться'] : ['About', 'Services', 'Contact']) : (ru ? ['Идея', 'Вкус', 'Попробовать'] : ['The idea', 'Flavours', 'Try it']);
  const changeView = (next: number) => { setView(next); setCheckout(false); setMessage(''); };
  const add = (index: number) => { setCart(previous => previous.map((value, i) => i === index ? Math.min(99, value + 1) : value)); setMessage(ru ? `${names[index]} — добавлен в корзину` : `${names[index]} — added to the basket`); };
  return <div className={`${styles.preview} ${styles[id.replace('-', '')]} ${interactive ? styles.interactive : ''}`} data-approach={approach} data-demo-format={id}>
    <div className={styles.chrome}><span><i /><i /><i /></span><small>{brand.replace('.', '')}.example{view ? `/${view === 2 ? 'contact' : 'about'}` : ''}</small><span aria-hidden="true">↗</span></div>
    <div className={styles.site}>
      <div className={styles.nav}><b>{brand}</b><div>{nav.map((label, i) => <Control interactive={interactive} key={i} onClick={() => changeView(i)} className={view === i ? styles.current : undefined}>{label}</Control>)}</div></div>
      <div className={styles.body}>
        {view === 0 && (id === 'shop' ? <>
          <div className={styles.shopIntro}><div><small>{ru ? 'ОБЖАРЕНО С ХАРАКТЕРОМ' : 'ROASTED WITH CHARACTER'}</small><h3>{ru ? <>Ваш новый<br />утренний ритуал.</> : <>Your new<br />morning ritual.</>}</h3></div><span aria-hidden="true">✳</span></div>
          <div className={styles.products}>{names.map((name, i) => <div className={styles.product} key={name}><div className={styles.productPhoto} data-colour={i}><div className={styles.bag}><b>r.</b><span>{name}</span><i>250 g</i></div></div><div className={styles.productMeta}><span>{name}<small>{prices[i]} <BelarusianRuble locale={locale} /></small></span><Control interactive={interactive} className={styles.add} onClick={() => add(i)} label={ru ? `Добавить ${name} в корзину` : `Add ${name} to basket`}>+</Control></div></div>)}</div>
        </> : <div className={styles.hero}>
          <div className={styles.heroCopy}><small>{id === 'landing' ? (ru ? 'КОФЕ ДЛЯ ВАШЕГО РИТМА' : 'COFFEE FOR YOUR RHYTHM') : id === 'business-card' ? (ru ? 'ДИЗАЙНЕР ИНТЕРЬЕРА' : 'INTERIOR DESIGNER') : (ru ? 'АРХИТЕКТУРА И ИНТЕРЬЕРЫ' : 'ARCHITECTURE & INTERIORS')}</small>
            <h3>{id === 'landing' ? (ru ? <>Хороший день<br />начинается<br /><em>с малого.</em></> : <>A good day<br />starts<br /><em>with a little.</em></>) : id === 'business-card' ? (ru ? <>Анна Левина.<br /><em>Место для жизни.</em></> : <>Anna Levina.<br /><em>Room for life.</em></>) : (ru ? <>Пространства,<br />в которые<br /><em>хочется вернуться.</em></> : <>Spaces<br />to come<br /><em>home to.</em></>)}</h3>
            <p>{id === 'landing' ? (ru ? 'Свежая обжарка. Знакомый вкус. Немного времени для себя.' : 'Freshly roasted. Comforting flavours. A moment for yourself.') : (ru ? 'Естественные материалы, спокойные цвета и внимание к вашей жизни.' : 'Natural materials, quiet colours and attention to the way you live.')}</p>
            <Control interactive={interactive} className={styles.heroAction} onClick={() => changeView(id === 'multi-page' ? 1 : 2)}>{id === 'multi-page' ? (ru ? 'О студии' : 'Meet the studio') : id === 'business-card' ? (ru ? 'Обсудить интерьер' : 'Plan your space') : (ru ? 'Найти свой вкус' : 'Find your flavour')}<span aria-hidden="true">↗</span></Control>
          </div>
          <div className={styles.heroImage}><img src={publicPath(id === 'landing' ? '/images/coffee.jpg' : '/images/interior.jpg')} alt={ru ? (id === 'landing' ? 'Кофе в тёплом свете' : 'Светлый современный интерьер') : (id === 'landing' ? 'Coffee in warm light' : 'A bright modern interior')} loading="lazy" /><span aria-hidden="true">{id === 'landing' ? '✳' : '01 / 03'}</span></div>
        </div>)}
        {view === 1 && <div className={styles.innerPage}><small>{nav[1]}</small><h3>{id === 'shop' ? (ru ? 'У каждого утра свой вкус.' : 'Every morning has a flavour.') : id === 'multi-page' ? (ru ? 'Сначала человек. Потом пространство.' : 'People first. Spaces follow.') : id === 'business-card' ? (ru ? 'От первой идеи до вашего дома.' : 'From an early idea to your home.') : (ru ? 'Три вкуса. Ваш ритм.' : 'Three flavours. Your rhythm.')}</h3><div className={styles.innerTiles}>{(id === 'shop' || id === 'landing' ? names : ru ? ['Консультация', 'Планировка', 'Полный проект'] : ['Consultation', 'Space planning', 'Full project']).map((name, i) => <div key={name}><span>0{i + 1}</span><h4>{name}</h4><p>{ru ? 'Внимание к деталям, понятный процесс и свой характер.' : 'Considered details, a clear process and a character of its own.'}</p></div>)}</div><Control interactive={interactive} className={styles.heroAction} onClick={() => changeView(2)}>{ru ? 'Следующий шаг' : 'Next step'} ↗</Control></div>}
        {view === 2 && (id === 'shop' ? <div className={styles.innerPage}><small>{ru ? 'ВАШ ВЫБОР' : 'YOUR SELECTION'}</small><h3>{checkout ? (ru ? 'Дальше — доставка и оплата.' : 'Next: delivery and payment.') : nav[2]}</h3>{checkout ? <p className={styles.demoExplanation}>{ru ? 'Это демонстрация пути покупателя. В настоящем магазине здесь будут контакты, выбор доставки и способ оплаты. Заказ не создаётся.' : 'This demonstrates the shopping journey. A real store would ask for contact, delivery and payment details here. No order is created.'}</p> : count ? <><div className={styles.cartLines}>{names.map((name, i) => cart[i] > 0 && <div key={name}><span>{name} × {cart[i]}</span><b>{cart[i] * prices[i]} <BelarusianRuble locale={locale} /></b><Control interactive={interactive} onClick={() => setCart(previous => previous.map((value, index) => index === i ? Math.max(0, value - 1) : value))} label={ru ? `Убрать ${name}` : `Remove ${name}`}>−</Control></div>)}</div><p className={styles.cartTotal}>{ru ? 'Итого' : 'Total'} <b>{cart.reduce((sum, value, i) => sum + value * prices[i], 0)} <BelarusianRuble locale={locale} /></b></p><Control interactive={interactive} className={styles.heroAction} onClick={() => setCheckout(true)}>{ru ? 'Перейти к оформлению' : 'Continue to checkout'} ↗</Control></> : <p className={styles.demoExplanation}>{ru ? 'Пока пусто. Добавьте кофе из каталога.' : 'Nothing here yet. Add a coffee from the catalogue.'}</p>}<Control interactive={interactive} className={styles.textAction} onClick={() => changeView(0)}>{ru ? 'Вернуться в каталог' : 'Back to the catalogue'} ↗</Control></div> : <div className={styles.innerPage}><small>{nav[2]}</small><h3>{ru ? 'Начнём с разговора.' : 'Let’s start a conversation.'}</h3><p className={styles.demoExplanation}>{ru ? 'Здесь посетитель сможет рассказать о задаче и оставить контакт.' : 'This is where a visitor can describe their brief and leave a contact.'}</p><div className={styles.fakeForm}><span>{ru ? 'Ваше имя' : 'Your name'}</span><span>{ru ? 'Телефон или email' : 'Phone or email'}</span><span>{ru ? 'Расскажите о задаче' : 'Tell us about your project'}</span></div><p className={styles.demoFootnote}>{ru ? 'Это пример формы. Никакие данные не собираются.' : 'An example form. No information is collected.'}</p><Control interactive={interactive} className={styles.heroAction} onClick={() => changeView(0)}>{ru ? 'Вернуться к примеру' : 'Back to the example'} ↗</Control></div>)}
      </div>
      {interactive && <p className={styles.feedback} role="status">{message || (ru ? 'Дизайн-концепт · можно попробовать меню и кнопки' : 'Design concept · try the navigation and buttons')}</p>}
    </div>
  </div>;
}
