const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyPlugin = require("copy-webpack-plugin");
const BUILD_PATH = "../build";

module.exports = {
  target: "node",
  entry: {
    app: ["./app.js"],
  },
  output: {
    path: path.resolve(__dirname, BUILD_PATH),
    filename: "app.js",
  },
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./package.json",
          to: `${BUILD_PATH}/package.json`,
        },
        {
          from: "./node_modules",
          to: `${BUILD_PATH}/node_modules`,
        },
        {
          from: "./.env",
          to: `${BUILD_PATH}/.env`,
          toType: "file",
        },
        {
          from: "./public",
          to: `${BUILD_PATH}/public`,
        },
      ],
    }),
  ],
};
