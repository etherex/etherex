module.exports = function(grunt) {
  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config.js");

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    webpack: {
      options: webpackConfig,
      build: {
        plugins: webpackConfig.plugins.concat(
          new webpack.DefinePlugin({
            "process.env": {
              // This has effect on the react lib size
              "NODE_ENV": JSON.stringify("production")
            }
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        )
      },
      "build-dev": {
        devtool: "sourcemap",
        debug: true
      }
    },
    "webpack-dev-server": {
      options: {
        webpack: webpackConfig
      },
      start: {
        keepAlive: true,
        port: 8089,
        contentBase: "app",
        hot: true,
        webpack: {
          devtool: "eval",
          debug: true,
          entry: webpackConfig.entry.concat(
            "webpack-dev-server/client?http://localhost:8089",
            "webpack/hot/dev-server"
          ),
          plugins: webpackConfig.plugins.concat(
            new webpack.HotModuleReplacementPlugin()
          )
        }
      }
    },
    jshint: {
      // define the files to lint
      files: ['Gruntfile.js', 'webpack.config.js', 'app/**/*.js', 'app/**/*.jsx'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
        // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          require: true,
          /* jest */
          afterEach: false,
          beforeEach: false,
          describe: false,
          expect: false,
          it: false,
          jest: false,
          pit: false,
          xdescribe: false,
          xit: false
        },
        "undef": true,
        "unused": true
      }
    },
    watch: {
      app: {
        files: ["app/**/*.js", "app/**/*.jsx", "app/**/*.css"],
        tasks: ["jshint", "webpack:build-dev"],
        options: {
          spawn: false,
        }
      }
    },
    "gh-pages": {
      options: {
        base: 'app',
        repo: 'git@github.com:etherex/etherex.git'
      },
      src: ['index.html', 'bundle.js', '*.svg', '*.woff', '*.eot', '*.ttf']
    },
    clean: ["app/*.svg", "app/*.woff", "app/*.eot", "app/*.ttf", "app/bundle.js", "app/*.js.map"]
  });

  // grunt.loadNpmTasks('grunt-jest');
  grunt.loadNpmTasks('grunt-jsxhint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask("default", ["webpack-dev-server:start"]);
  grunt.registerTask("dev", ["jshint", "webpack:build-dev", "watch:app"]);
  grunt.registerTask("build", ["clean", "jshint", "webpack:build"]);
  grunt.registerTask("publish", ["build", "gh-pages"]);
};
