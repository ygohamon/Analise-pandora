const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

module.exports = {
  entry: [
    'webpack/hot/poll?100',
    './src/init.ts'
  ],
  watch: true,
  target: 'node',
  mode: 'development',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new StartServerPlugin({
      name : 'pandora-server.js'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    function() {
      this.plugin("done", function(stats)
      {
        if (stats.compilation.errors && stats.compilation.errors.length){
          console.log(stats.compilation.errors);
          process.exit(1);
        }
      });
    }
  ],
  output: {
    path: path.join(__dirname, '../../build'),
    filename: 'pandora-server.js',
  }
};
