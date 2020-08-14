const webpack = require("webpack"),
    path = require("path"),
    HTMLWebpackPlugin = require("html-webpack-plugin"),
    { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "source-map",
    devServer: {
        contentBase: path.resolve(__dirname, 'build'),
        port: 8080
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|tff)$/,
                use: 'file-loader'
            },
            {
                test: /\.svg$/,
                use: ['svg-inline-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options:{
                            presets: [
                                "@babel/preset-env",
                                "@babel/preset-react"
                            ]
                        }
                    }
                ]
            }

        ]
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                "**/*"
            ]
        }),
        new HTMLWebpackPlugin({
            title: "Bua FaceTime",
            meta: {
                author: "K.T Motshoana",
                applicationName: "Bua Facetime",
                description: "webapp facetime with built in voice effects",
                robots: "index,follow",
                googlebot: "index,follow",
                keywords: "Bua Facetime, K.T motshoana, webrtc facetime"

            },
            favicon: path.resolve("src/favicons/favicon.png")
        })
    ]
}