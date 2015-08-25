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
    eslint: {
      options: {
        configFile: '.eslintrc'
      },
      target: ['Gruntfile.js', 'webpack.config.js', 'app/**/*.js', 'app/**/*.jsx']
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        singleRun: true
      },
      continuous: {
        singleRun: false
        // browsers: ['PhantomJS']
        // background: true
      }
    },
    watch: {
      app: {
        files: ["app/**/*.js", "app/**/*.jsx", "app/**/*.css"],
        tasks: ["eslint", "webpack:build-dev"],
        options: {
          spawn: false
        }
      }
    },
    "gh-pages": {
      options: {
        base: 'app',
        repo: 'git@github.com:etherex/etherex.git'
      },
      src: ['index.html', 'app.js', '*.svg', '*.woff', '*.eot', '*.ttf', '*.ico', '*.jpg', '*.png']
    },
    clean: ["app/*.svg", "app/*.woff", "app/*.eot", "app/*.ttf", "app/app.js", "app/*.js.map", "app/*.jpg", "app/*.png"]
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask("default", ["webpack-dev-server:start"]);
  grunt.registerTask("dev", ["eslint", "webpack:build-dev", "watch:app"]);
  grunt.registerTask("build", ["clean", "eslint", "webpack:build"]);
  grunt.registerTask("publish", ["build", "gh-pages"]);
  grunt.registerTask("lint", ["eslint"]);
};
