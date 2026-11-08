import Link from 'next/link';
import type { ReactNode } from 'react';
import { copy, homePath, privacyPath, projects, site, workPath, type Locale, type Project } from '@/lib/content';
import { Header } from './Header';
import { InquiryForm } from './InquiryForm';
import { Services } from './Services';
import { inquiryCopy } from '@/lib/inquiry-content';
import inquiryStyles from './Inquiry.module.css';
import styles from './Site.module.css';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Brand({ locale }: { locale: Locale }) {
  return <Link href={homePath(locale)} className={styles.brand} aria-label={locale === 'ru' ? 'NODRA, главная' : 'NODRA, home'}><span className={styles.brandMark} aria-hidden="true" /><span>NODRA</span></Link>;
}

function Lines({ text }: { text: string }) { return <>{text.split('\n').map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</>; }

function SectionHeading({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{label}</p><h2><Lines text={title} /></h2></div>{children && <p className={styles.sectionIntro}>{children}</p>}</div>;
}

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <footer className={styles.footer}><div className={styles.footerTop}><Brand locale={locale} /><p>{t.footer}<br /><span>{t.location}</span></p><Link href={privacyPath(locale)}>{t.privacy} <span aria-hidden="true">↗</span></Link></div><div className={styles.footerBottom}><p>{site.providerName ? `${site.providerName}${site.providerTaxId ? ` · ${site.providerTaxId}` : ''}` : t.provider}</p><span>© {new Date().getFullYear()} NODRA</span></div></footer>;
}

export function Contact({ locale }: { locale: Locale }) {
  const t = inquiryCopy[locale];
  return <section id="contact" className={inquiryStyles.section} aria-labelledby="contact-title"><div className={inquiryStyles.pitch}><p className={inquiryStyles.badge}><span aria-hidden="true">✳</span>{t.badge}</p><h2 id="contact-title">{t.title[0]}<br />{t.title[1]}</h2><p className={inquiryStyles.intro}>{t.intro}</p><div className={inquiryStyles.points}>{t.points.map(([title, text], i) => <div key={title}><span aria-hidden="true">{i === 0 ? '▤' : '↗'}</span><h3>{title}</h3><p>{text}</p></div>)}</div><div className={inquiryStyles.art} aria-hidden="true"><span>✳</span><i /><b>n.</b></div>{(site.telegram || site.email) && <div className={inquiryStyles.directLinks}>{site.telegram && <a href={site.telegram} target="_blank" rel="noopener noreferrer">Telegram ↗</a>}{site.email && <a href={`mailto:${site.email}`}>Email ↗</a>}</div>}</div><InquiryForm locale={locale} /></section>;
}

export function ProjectVisual({ project, locale, large = false }: { project: Project; locale: Locale; large?: boolean }) {
  const isRu = locale === 'ru';
  return <div className={`${styles.projectVisual} ${styles[project.id]} ${large ? styles.visualLarge : ''}`}>
    {project.id === 'marta' && <><span className={styles.previewAnnotation}>{isRu ? 'ПИЛАТЕС. ДОМА. ДЛЯ СЕБЯ.' : 'PILATES. AT HOME. FOR YOU.'}</span><div className={styles.martaBrowser}><div className={styles.browserBar}><span /><span /><span /><small>martamarafon.by</small></div><div className={styles.martaScreen}><div className={styles.martaTitle}><span>{isRu ? 'ДОМАШНИЙ' : 'AT-HOME'}</span><strong>{isRu ? 'ПИЛАТЕС' : 'PILATES'}</strong><i>{isRu ? 'с Мартой' : 'with Marta'}</i></div><img src={project.image} alt={project.imageAlt[locale]} width="800" height="1000" loading="lazy" /><div className={styles.previewButton}>{isRu ? 'Присоединиться к марафону' : 'Join the programme'} <span>↗</span></div></div></div><span className={styles.previewCorner}>{isRu ? 'ДИЗАЙН + РАЗРАБОТКА' : 'DESIGN + DEVELOPMENT'}</span></>}
    {project.id === 'forma' && <div className={styles.formaBrowser}><div className={styles.formaNav}><b>forma</b><small>{isRu ? 'ПРОЕКТЫ　 О СТУДИИ　 КОНТАКТЫ' : 'PROJECTS　 STUDIO　 CONTACT'}</small></div><div className={styles.formaHeadline}><span>{isRu ? 'Пространство' : 'Spaces'}<br /><i>{isRu ? 'для жизни.' : 'for living.'}</i></span><small>INTERIOR<br />DESIGN STUDIO</small></div><img src={project.image} alt={project.imageAlt[locale]} width="1400" height="934" loading="lazy" /><div className={styles.formaBottom}>{isRu ? 'Тёплый минимализм. Продуманные детали.' : 'Warm minimalism. Considered details.'}<span>↗</span></div></div>}
    {project.id === 'daily' && <><div className={styles.dailyLeft}><div className={styles.dailyTop}><span>DAILY</span><span>{isRu ? 'КОФЕ И КОЕ-ЧТО ЕЩЁ' : 'COFFEE & A LITTLE MORE'}</span></div><p>{isRu ? 'Хороший день' : 'A good day'}<br />{isRu ? 'начинается' : 'starts'}<br /><i>{isRu ? 'с кофе.' : 'with coffee.'}</i></p><div className={styles.dailyBottom}><span>{isRu ? 'ВАШ ЕЖЕДНЕВНЫЙ РИТУАЛ' : 'YOUR EVERYDAY RITUAL'}</span><span aria-hidden="true">✳</span></div></div><div className={styles.dailyRight}><img src={project.image} alt={project.imageAlt[locale]} width="1200" height="800" loading="lazy" /><span className={styles.dailyBadge}>{isRu ? 'ЕЩЁ\nЧАШЕЧКУ?' : 'ONE\nMORE CUP?'}</span></div></>}
  </div>;
}

function HeroArt({ locale }: { locale: Locale }) {
  return <div className={styles.heroArt} role="img" aria-label={locale === 'ru' ? 'Абстрактная композиция из цветных кругов и звезды' : 'An abstract composition of colourful circles and a star'}><div className={styles.artGrid} /><div className={styles.sun}><div /></div><div className={styles.planet}><div /><span className={styles.planetOrbit} /></div><div className={styles.spark}>✦</div><div className={styles.artCaption}><span className={styles.captionMark}>n.</span><span>{locale === 'ru' ? <>Идея обретает<br />свою форму.</> : <>An idea finds<br />its form.</>}</span><span aria-hidden="true">↗</span></div><span className={styles.artPlus} aria-hidden="true">+</span></div>;
}

export function Home({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <><Header locale={locale} /><main id="main">
    <section className={styles.hero}><div className={styles.heroText}><p className={styles.eyebrow}><span className={styles.statusDot} />{t.eyebrow}</p><h1>{t.hero[0]}<br /><span>{t.hero[1]}</span><span className={styles.heroPeriod} aria-hidden="true" /></h1><p className={styles.heroIntro}>{t.intro}</p><div className={styles.heroActions}><a href="#contact" className={styles.button}>{t.talk}<Arrow diagonal /></a><a href="#work" className={styles.textLink}>{t.viewWork}<Arrow /></a></div><p className={styles.heroNote}><span aria-hidden="true">↳</span> {t.heroNote}</p></div><HeroArt locale={locale} /></section>
    <div className={styles.capabilityStrip}>{t.strip.map((item, i) => <span key={item}><span className={styles.stripSymbol} aria-hidden="true">{['✳', '↗', '⌘', '✦'][i]}</span>{item}</span>)}</div>

    <section id="services" className={styles.section}><SectionHeading label={t.servicesLabel} title={t.servicesTitle}>{t.servicesIntro}</SectionHeading><Services locale={locale} /></section>

    <section id="work" className={`${styles.section} ${styles.workSection}`}><SectionHeading label={t.workLabel} title={t.workTitle}>{t.workIntro}</SectionHeading><div className={styles.projectGrid}>{projects.map((project, index) => <article className={`${styles.projectCard} ${project.id === 'daily' ? styles.wideCard : ''}`} key={project.id}><Link className={styles.projectImageLink} href={workPath(locale, project.slug)} aria-label={`${t.case}: ${project.text[locale].title}`}><ProjectVisual project={project} locale={locale} /><span className={styles.projectHoverArrow}><Arrow diagonal /></span></Link><div className={styles.projectInfo}><div><p className={styles.projectCategory}>{project.text[locale].category} <span>/</span> {project.kind === 'live' ? t.real : t.concept}</p><h3><Link href={workPath(locale, project.slug)}>{project.text[locale].title}</Link></h3><p className={styles.projectSummary}>{project.text[locale].summary}</p></div><span className={styles.projectIndex}>0{index + 1}</span></div></article>)}</div></section>

    <section className={`${styles.section} ${styles.approachSection}`}><SectionHeading label={t.approachLabel} title={t.approachTitle} /><div className={styles.approachGrid}>{t.approach.map((item, i) => <article key={item.title}><span className={`${styles.approachSymbol} ${styles[`symbol${i}`]}`} aria-hidden="true">{['✳', '↗', '◒', '✦'][i]}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>

    <section className={styles.pricing}><div><p className={styles.eyebrow}>{t.pricingLabel}</p><h2><Lines text={t.pricingTitle} /></h2></div><div><p className={styles.pricingText}>{t.pricingText}</p><a href="#contact" className={styles.button}>{t.talk}<Arrow diagonal /></a><p className={styles.pricingNote}>{t.pricingNote}</p></div><span className={styles.pricingDecoration} aria-hidden="true">✳</span></section>

    <section id="process" className={styles.section}><SectionHeading label={t.processLabel} title={t.processTitle} /><ol className={styles.processList}>{t.process.map((step, i) => <li key={step.title}><span className={styles.processNumber}>0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><span className={styles.processArrow} aria-hidden="true">↗</span></li>)}</ol></section>

    <section id="faq" className={`${styles.section} ${styles.faqSection}`}><div><p className={styles.eyebrow}>{t.faqLabel}</p><h2><Lines text={t.faqTitle} /></h2><span className={styles.faqFlower} aria-hidden="true">✳</span></div><div className={styles.faqList}>{t.faq.map(([q, a]) => <details key={q}><summary>{q}<span className={styles.faqPlus} aria-hidden="true" /></summary><p>{a}</p></details>)}</div></section>
    <Contact locale={locale} />
  </main><Footer locale={locale} /></>;
}

export function ProjectPage({ locale, project }: { locale: Locale; project: Project }) {
  const t = copy[locale];
  const p = project.text[locale];
  const next = projects[(projects.findIndex(item => item.id === project.id) + 1) % projects.length];
  return <><Header locale={locale} slug={project.slug} /><main id="main"><section className={styles.caseHero}><Link className={styles.backLink} href={`${homePath(locale)}#work`}><span aria-hidden="true">←</span>{t.back}</Link><p className={styles.eyebrow}>{p.category} / {project.kind === 'live' ? t.real : t.concept}</p><h1>{p.title}</h1><p className={styles.caseDescription}>{p.description}</p><div className={styles.caseMeta}><div><span>{t.projectRole}</span><p>{p.role}</p></div><div><span>{t.projectFormat}</span><p>{p.format}</p></div><div><span>{locale === 'ru' ? 'Статус' : 'Status'}</span><p className={styles.caseStatus}><span className={styles.statusDot} />{project.kind === 'live' ? t.real : t.concept}</p></div></div></section><div className={styles.caseVisual}><ProjectVisual project={project} locale={locale} large /></div><section className={styles.caseContent}><div><p className={styles.eyebrow}>01 / {t.projectDetails}</p><h2>{t.projectTask}</h2><p>{p.task}</p>{project.url && <a className={styles.button} href={project.url} target="_blank" rel="noopener noreferrer">{t.visit}<Arrow diagonal /></a>}</div><div><h2>{t.projectSolution}</h2><ul>{p.solution.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul></div></section><p className={styles.projectNotice}><span aria-hidden="true">{project.kind === 'live' ? '↗' : '✳'}</span>{project.kind === 'live' ? t.realNotice : t.conceptNotice}</p><section className={styles.nextProject}><Link href={workPath(locale, next.slug)}><span>{t.nextProject}</span><strong>{next.text[locale].title}</strong><Arrow diagonal /></Link></section><Contact locale={locale} /></main><Footer locale={locale} /></>;
}

export function Privacy({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return <><Header locale={locale} privacy /><main id="main" className={styles.legal}><Link className={styles.backLink} href={homePath(locale)}>← {t.home}</Link><p className={styles.eyebrow}>NODRA / {locale === 'ru' ? 'ИНФОРМАЦИЯ' : 'INFORMATION'}</p><h1>{t.privacyTitle}</h1><p className={styles.legalIntro}>{t.privacyIntro}</p>{t.privacySections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</main><Footer locale={locale} /></>;
}
