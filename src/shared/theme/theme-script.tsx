// Inline script injected into <head> to apply the dark class before first paint,
// preventing a flash of unstyled light content on dark-mode preference loads.
// Intentionally kept minimal — no imports, no React state.
export function ThemeScript() {
  const script = `(function(){try{var k='ai-code-review-trainer-theme',s=localStorage.getItem(k);if(s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
