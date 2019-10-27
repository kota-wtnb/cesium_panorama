const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const MODE = "development";
const enabledSourceMap = MODE === "development";

module.exports = {
    devtool: 'source-map',
    mode: MODE,
    entry: './src/js/main.js',
    output: {
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'docs')
    },
    module: {
        rules: [
            {
                test: /\.scss/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                            sourceMap: enabledSourceMap,
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: enabledSourceMap
                        }
                    }
                ]
            },
            {
                test: /\.pug/,
                use: [
                    {
                        loader: "pug-loader",
                        options: {
                            pretty: true
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: "docs",
        open: true,
        host: '0.0.0.0',
        port: 3000
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/style.css'
        }),
        new HtmlWebpackPlugin({
            template: './src/pug/index.pug'
        }),
        new CopyWebpackPlugin([
            {
                from: './src/img',
                to: 'img'
            }
        ])
    ]
};