const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool:
    process.env.NODE_ENV === 'production'
      ? false
      : 'cheap-module-eval-source-map',
  target: 'node',
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    extensions: ['.js'],
  },
  devServer: {
    contentBase: './dist',
  },
};
