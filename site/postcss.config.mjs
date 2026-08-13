/**
 * Deliberately empty, and it has to exist.
 *
 * This site uses plain CSS with custom properties and no Tailwind. Without a
 * config here, Turbopack walks up the tree and finds the **product's**
 * `postcss.config.js` at the repository root, which requires `tailwindcss` — a
 * dependency of the product, not of this application.
 *
 * That failed only on Vercel, and only once the site started building there
 * rather than being uploaded pre-built: locally `tailwindcss` resolves from the
 * repository's own `node_modules`, so the parent config loads and everything
 * works. A git build installs inside `site/` alone, so it does not.
 *
 * The import-graph check that cleared this application to build in isolation
 * looked at what the code imports. It did not look at what the *build* requires,
 * which is how a config file two directories up became a missing module.
 *
 * `.mjs`, because this package is `"type": "module"` and a `.js` file using
 * `module.exports` fails to evaluate — with an error that names the syntax
 * rather than the file, which is a confusing minute of its own.
 */
export default { plugins: {} };
