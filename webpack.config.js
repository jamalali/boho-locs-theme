var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var MergeFileLoaderFilesPlugin = require('./build/plugins/MergeFileLoaderFiles.js');
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
var EslintFriendlyFormatter = require('eslint-friendly-formatter');


// This ensures MergeFilesPlugin can output successfully
if (!fs.existsSync(path.resolve('dist'))) {
    fs.mkdirSync(path.resolve('dist'));
}
if (!fs.existsSync(path.resolve('dist/assets'))) {
    fs.mkdirSync(path.resolve('dist/assets'));
}


module.exports = {
    target: 'web',
    entry: ["babel-polyfill", './src/main.js'],
    output: {
        filename: 'assets/theme.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./lib'),
            path.resolve('./node_modules'),
        ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: [
            '.js', '.json', '.vue', '.jsx',
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|vue)/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [path.resolve('src'), path.resolve('lib')],
                options: {
                    formatter: EslintFriendlyFormatter,
                    emitWarning: true,
                },
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader'
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.txt$/,
                use: 'raw-loader'
            },
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'tmp_[path].css.liquid'
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            functions: {
                                'liquid($str)': function(str) {
                                    return str;
                                }
                            }
                        }
                    },
                ]
            },
            {
                test: /\.liquid$/,
                use: [
                    {loader: 'raw-loader'}
                ]
            }
        ]
    },
    plugins: [
        new FriendlyErrorsWebpackPlugin(),
        new CopyWebpackPlugin([
             { from: 'src/theme', to: './' },
        ]),
        new MergeFileLoaderFilesPlugin({
            filename: 'dist/assets/theme.css.liquid',
            test: /\.css\.liquid$/,
            deleteSourceFiles: true
        }),
    ]
};


if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
