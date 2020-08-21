const webpack = require("webpack"),
  path = require("path"),
  HTMLWebpackPlugin = require("html-webpack-plugin"),
  { CleanWebpackPlugin } = require("clean-webpack-plugin"),
  WebpackPwaManifest = require("webpack-pwa-manifest"),
  { GenerateSW } = require("workbox-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
  },
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    port: 8080,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|tff)$/,
        use: "file-loader",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],

              plugins: [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties",
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*"],
    }),
    new HTMLWebpackPlugin({
      title: "Bua FaceTime",
      meta: {
        author: "K.T Motshoana",
        applicationName: "Bua Facetime",
        description: "video chat application with WRTC",
        robots: "index,follow",
        googlebot: "index,follow",
        keywords:
          "Bua Facetime, K.T motshoana, webrtc facetime, video chat web app javascript",
      },

      favicon: path.resolve("src/favicons/favicon.png"),
    }),
    new WebpackPwaManifest({
      short_name: "Bua FaceTime",
      name: "Bua FaceTime",
      description: "a secured video chat in the browser",
      author: "K.T Motshoana",
      lang: "en-US",
      start_url: ".",
      background_color: "#222",
      theme_color: "#ff9b04",
      scope: "/",
      display: "standalone",
      icons: [
        {
          src: path.resolve("src/icons/144x144.png"),
          type: "image/png",
          sizes: "144x144",
          purpose: "any",
        },
        {
          src: path.resolve("src/icons/192x192.png"),
          type: "image/png",
          sizes: "192x192",
          purpose: "any",
        },
        {
          src: path.resolve("src/icons/512x512.png"),
          type: "image/png",
          sizes: "512x512",
          purpose: "any",
        },
      ],
    }),
    new GenerateSW({
      swDest: "sw.js",
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
};
