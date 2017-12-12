// Dependencies
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const path = require("path");
const fs = require("fs")
//  Useful functions
const utils = require("./utils");

// Getting node evn.
const env = process.env.NODE_ENV ? process.env.NODE_ENV : '"production"';

// Generating webpack settings...
const webpackConfig = {
	entry: {},
	output: {
		path: path.resolve(__dirname, "../server/public"),
		filename: 'js/[name].[chunkhash].js',
		publicPath: '/',
		chunkFilename: 'js/[id].[chunkhash].js'
	},
	plugins: [
		new CleanWebpackPlugin([
			"public",
			"views"
		], {
			root: path.resolve(__dirname, "../server"),
			dry: false,
			verbose: true
		})
	],
	module: {
		rules: [{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						babelrc: true,
						comments: false,
						minified: true
					}
				}
			},
			{
				test: /\.html$/,
				use: [{
					loader: 'html-loader'
				}]
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader"
				})
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				use: [
					'file-loader',
					{
						loader: 'image-webpack-loader',
						options: {
							name: "img/[name].[hash:7].[ext]",
							outputPath: 'img/'
						},
					},
				],
			},
			{
				test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: "media/[name].[hash:7].[ext]"
				}
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: "fonts/[name].[hash:7].[ext]"
				}
			}
		]
	}
}
// http://vuejs.github.io/vue-loader/en/workflow/production.html
webpackConfig.plugins.push(new webpack.DefinePlugin({
	'process.env': env
}))

// Compressing javascript files
webpackConfig.plugins.push(new UglifyJsPlugin({
	uglifyOptions: {
		compress: {
			warnings: false
		}
	},
	sourceMap: true,
	parallel: true
}))

/**
 * // split vendor js into its own file
webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
	name: 'vendor',
	minChunks: function (module, count) {
		// any required modules inside node_modules are extracted to vendor
		return (
			module.resource &&
			/\.js$/.test(module.resource) &&
			module.resource.indexOf(
				path.join(__dirname, '../node_modules')
			) === 0
		)
	}
}))
 */


// extract webpack runtime and module manifest to its own file in order to
// prevent vendor hash from being updated whenever app bundle is updated
webpackConfig.plugins.push(new webpack.optimize.CommonsChunkPlugin({
	name: 'manifest',
	chunks: ['vendor']
}))

// copy custom static assets
if (fs.readdirSync(path.resolve(__dirname, '../client/static')).length) {
	webpackConfig.plugins.push(new CopyWebpackPlugin([{
		from: path.resolve(__dirname, '../client/static'),
		to: path.resolve(__dirname, "../server/public"),
		ignore: ['.*']
	}]))
}


const targetFolder = path.resolve(__dirname, "../client/");
utils.getFiles(targetFolder).forEach(file => {
	if (utils.isHTML(file)) {
		const fileInfo = path.parse(file);
		if (fs.existsSync(path.resolve(__dirname, "../client/js/" + fileInfo.name + ".js"))) {
			webpackConfig.entry[fileInfo.name] = path.resolve(__dirname, "../client/js/" + fileInfo.name + ".js");
		}
		webpackConfig.plugins.push(new HtmlWebpackPlugin({
			template: file,
			filename: path.resolve(__dirname, "../server/views/" + fileInfo.name + ".hbs"),
			root: path.resolve(__dirname, '../server/views'),
			minify: {
				removeComments: true,
				collapseWhitespace: true
			},
			chunks: [fileInfo.name]
		}))

		// extract css into its own file
		webpackConfig.plugins.push(new ExtractTextPlugin({
			filename: "css/[name].[contenthash].css",
			disable: false,
			allChunks: true
		}))
	}
})

// Compress extracted CSS. We are using this plugin so that possible
// duplicated CSS from different components can be deduped.
webpackConfig.plugins.push(new OptimizeCSSPlugin({
	cssProcessorOptions: {
		safe: true
	}
}))

webpackConfig.plugins.push(new OfflinePlugin({
	caches: {
		main: [/\.js$/, /\.css$/, /\.(png|jpe?g|gif|svg)(\?.*)?$/],
		additional: [/\.(woff2?|eot|ttf|otf)(\?.*)?$/, /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/],
		optional: []
	},
	relativePaths: false,
	ServiceWorker: {
		minify: true,
		cacheName: "Housepecker",
		navigateFallbackURL: "/",
		events: true
	},
	AppCache: {
		events: true
	}
}))

module.exports = webpackConfig