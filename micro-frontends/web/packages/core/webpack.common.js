const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index",
  resolve: {
    extensions: [ ".js", ".jsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    alias: {
      'react-i18next': require.resolve('react-i18next'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
