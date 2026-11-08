import styles from './StudioArt.module.css';

export function ServiceSketch({ kind }: { kind: string }) {
  return <div className={`${styles.serviceSketch} ${styles[kind.replace('-', '')] || ''}`} aria-hidden="true">
    <div className={styles.sketchHalo} />
    <div className={styles.sketchWindow}>
      <div className={styles.sketchBar}><i /><i /><i /><span /></div>
      {kind === 'shop' ? <><div className={styles.shopHeading}><b /><i /></div><div className={styles.shopProducts}><span><i /></span><span><i /></span><span><i /></span></div><div className={styles.shopFooter}><i /><b /></div></> : kind === 'business-card' ? <div className={styles.identity}><span className={styles.avatar} /><div><b /><i /><i /><em /></div></div> : kind === 'landing' ? <div className={styles.landingLayout}><div><b /><b /><i /><em /></div><span>✳</span></div> : <><div className={styles.pagesNav}><b /><i /><i /><i /></div><div className={styles.pagesGrid}><span /><div><b /><i /><i /></div></div><div className={styles.pagesTiles}><i /><i /><i /></div></>}
    </div>
    <span className={styles.sketchAccent}>{kind === 'shop' ? '+' : kind === 'business-card' ? '↗' : kind === 'landing' ? '✦' : '⌘'}</span>
    {kind === 'multi-page' && <div className={styles.backPage} />}
  </div>;
}

export function ApproachArt() {
  return <div className={styles.approachArt} aria-hidden="true">
    <span className={styles.approachCircle} /><span className={styles.approachOrbit} />
    <div className={styles.desktopCanvas}><div className={styles.canvasBar}><span>Dubas</span><i /><i /><i /></div><div className={styles.canvasContent}><div className={styles.canvasText}><b /><b /><i /><i /><em /></div><div className={styles.canvasSun}>✳</div></div><div className={styles.canvasTiles}><i /><i /><i /></div></div>
    <div className={styles.phoneCanvas}><div /><b /><b /><span>✦</span><i /><i /><em /></div>
    <span className={styles.codeChip}>&lt;/&gt;</span><span className={styles.approachSpark}>✦</span>
  </div>;
}

export function ProcessArt({ step, title }: { step: number; title: string }) {
  return <div className={styles.processArt} data-stage={step} aria-hidden="true">
    <div className={styles.processOrbit} /><span className={styles.processPetal}>✳</span>
    <div className={styles.processWindow}><div className={styles.sketchBar}><i /><i /><i /><span /></div><div className={styles.processDrawing} key={step}>
      {step === 0 ? <div className={styles.discussion}><span /><span /><i>↗</i></div> : step === 1 ? <div className={styles.wireframe}><b /><div><i /><i /><i /></div><span /><span /></div> : step === 2 ? <div className={styles.palette}><span /><span /><span /><span /><b>Aa</b></div> : step === 3 ? <div className={styles.codeDrawing}><b>&lt;/&gt;</b><i /><i /><i /><i /></div> : <div className={styles.launchDrawing}><span>✓</span><i /><i /></div>}
    </div><div className={styles.processCaption}><span>0{step + 1}</span><b>{title}</b><i>↗</i></div></div>
    <span className={styles.processDot} />
  </div>;
}

export function FaqArt() {
  return <div className={styles.faqArt} aria-hidden="true"><span>✳</span><i /><b>?</b><em /></div>;
}
