const banner2 = require('rollup-plugin-banner2')
module.exports = {
  input: 'src/main.js',
  output: {
    file: 'bin/main.js',
    format: 'cjs',
  },
  plugins: [banner2(() => '#!/usr/bin/env node\n')],
  external: [
    'node:fs',
    'gogocode',
    'postcss',
    'node-sass',
    "chalk",
    'commander',
    'glob',
    'node-sass-alias-importer'
  ],
}
