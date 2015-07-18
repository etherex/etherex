var webpackConfig = require('./webpack.config');
webpackConfig.devtool = 'inline-source-map';

module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ],
    singleRun: true,
    frameworks: [ 'mocha' ],
    files: [
      'tests.karma.js'
    ],
    preprocessors: {
      'tests.karma.js': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'dots' ],
    // https://github.com/karma-runner/karma/issues/1497
    // https://github.com/webpack/karma-webpack/pull/63
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    }
  });
};
