// `panel.css` is imported as a string: tsup's text loader inlines it into
// `panel.js` (see tsup.config.ts), so the panel needs no second request.
declare module '*.css' {
  const css: string
  export default css
}
