module.exports = {
  input: 'src/main.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
  },
  external: [
    'node:fs',
    'gogocode',
    'postcss',
    'node-sass',
    'commander',
    'glob',
  ],
}
