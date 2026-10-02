import { defineConfig } from 'tsup'

/**
 * Three artefacts out of one package, because they are installed in three
 * different ways (ADR-0046 §2):
 *
 * - `index` is the headless library, for a studio that bundles it themselves;
 * - `appwin` is the loader the snippet points at, served from the CDN;
 * - `panel` is the messenger the loader runs in its iframe, with its
 *   stylesheet inlined (the `.css` text loader below), so the iframe is built
 *   from one script and no document has to be fetched.
 *
 * The last two are what a browser downloads from a studio's page, so they are
 * IIFE and minified with no exports to tree-shake around.
 *
 * No `clean` here: tsup runs the two configurations in parallel, and the one
 * that cleans would race the other's output. The build script empties `dist`
 * once, before either starts.
 */
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    // The bundle ships to a studio's site: every byte is theirs, not ours.
    minify: true,
    treeshake: true,
    target: 'es2021',
  },
  {
    entry: { appwin: 'src/widget/loader.ts', panel: 'src/widget/panel.ts' },
    format: ['iife'],
    outExtension: () => ({ js: '.js' }),
    minify: true,
    treeshake: true,
    target: 'es2021',
    loader: { '.css': 'text' },
  },
])
