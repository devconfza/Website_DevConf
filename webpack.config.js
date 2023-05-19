const path = require('path')

module.exports = {
    entry: './src/devconf.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'devconf.js',
        path: path.resolve(__dirname, 'scripts'),
    },
    devtool: "source-map",
}
