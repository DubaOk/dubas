// Set the theme before the first paint, including when storage is disabled.
const script = `(()=>{let t;try{t=localStorage.getItem('dubas-theme')}catch{}document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
