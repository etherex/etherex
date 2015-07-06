module.exports = {
  entry: [
    "./app/app.jsx"
  ],
  output: {
    /* global __dirname */
    path: __dirname + "/app",
    filename: "app.js"
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
      { test: /\.js$/, exclude: /node_modules/, loader: "babel"},
      { test: /\.jsx$/, exclude: /node_modules/, loader: "babel"},
      { test: /\.json$/, loader: "json" },
      { test: /\.woff$/, loader: "url?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf$/, loader: "file" },
      { test: /\.eot$/, loader: "file" },
      { test: /\.svg$/, loader: "file" },
      { test: /\.gif/, loader: 'url?limit=10000&minetype=image/gif' },
      { test: /\.jpg/, loader: 'url?limit=10000&minetype=image/jpg' },
      { test: /\.png/, loader: 'url?limit=10000&minetype=image/png' }
    ]
  }
};
