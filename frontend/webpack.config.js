var path = require('path');

module.exports = {
  entry: [
    "./app/app.jsx"
  ],
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  output: {
    /* global __dirname */
    path: path.join(__dirname, "app"),
    filename: "app.js"
  },
  plugins: [],
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.jsx$/, loader: "react-hot" },
      { test: /\.js$/, include: /app/, loader: "babel"},
      { test: /\.jsx$/, include: /app/, loader: "babel", query: { presets: ["react", "es2015"] }},
      { test: /\.json$/, loader: "json" },
      { test: /\.woff|woff2$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/, loader: "file" },
      { test: /\.eot$/, loader: "file" },
      { test: /\.svg$/, loader: "file" },
      { test: /\.gif/, loader: 'url?limit=10000&mimetype=image/gif' },
      { test: /\.jpg/, loader: 'url?limit=10000&mimetype=image/jpg' },
      { test: /\.png/, loader: 'url?limit=10000&mimetype=image/png' }
    ]
  }
};
