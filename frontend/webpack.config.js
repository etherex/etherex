module.exports = {
  entry: [
    "./app/app.jsx"
  ],
  output: {
    /* global __dirname */
    path: __dirname + "/app",
    filename: "bundle.js"
  },
  plugins: [],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.jsx$/, loaders: ["react-hot", "jsx"] },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.woff$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/, loader: "file-loader" },
      { test: /\.eot$/, loader: "file-loader" },
      { test: /\.svg$/, loader: "file-loader" },
      { test: /\.gif/, loader: 'url-loader?limit=10000&minetype=image/gif' },
      { test: /\.jpg/, loader: 'url-loader?limit=10000&minetype=image/jpg' },
      { test: /\.png/, loader: 'url-loader?limit=10000&minetype=image/png' }
    ]
  },
  externals:[{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
  }]
};
