const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
  entry: './src/site.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'devconf-[fullhash:8].js',
    path: path.resolve(__dirname, 'scripts')
  },
  plugins: [
    new RemovePlugin({
        before: {
           include: [
             "./scripts",
           ]
        },
        watch: {
          include: [
            "./scripts",
          ]
        },
    })
]
};