module.exports = {
  productionSourceMap: false,
  publicPath: process.env.VUE_APP_BUILD === 'lib' ? '/' : '/vue-split-pane/',
  outputDir: process.env.VUE_APP_BUILD === 'lib' ? 'dist' : 'docs',
};
