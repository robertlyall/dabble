const path = require("path");
const webpack = require("webpack");
// const { dependencies } = require("./package.json");

module.exports = () => ({
  // externals: Object.keys(dependencies || {}),

  entry: path.join(__dirname, "login", "index.js"),

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },

  output: {
    path: path.join(__dirname, "login"),
    filename: "bundle.js"
    // library: "Interface",
    // libraryTarget: "umd"
  },

  resolve: {
    extensions: [".js", ".jsx", ".json"],
    modules: [path.join(__dirname, "app"), "node_modules"]
  },

  plugins: [new webpack.NamedModulesPlugin()],

  target: "electron-renderer"
});
