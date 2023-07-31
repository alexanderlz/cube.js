const fromExports = require('./dist/src');
const { VerticaDriver } = require('./dist/src/VerticaDriver');

/**
 * this comment is a tribute to the guy who wrote it in PostgresDriver>>>
 * After 5 years working with TypeScript, now I know
 * that commonjs and nodejs require is not compatibility with using export default
 */
const toExport = VerticaDriver;

// eslint-disable-next-line no-restricted-syntax
for (const [key, module] of Object.entries(fromExports)) {
  toExport[key] = module;
}

module.exports = toExport;
