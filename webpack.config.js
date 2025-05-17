const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/background.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'background.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            fs: false, // If lancedb needs Node core modules, polyfill or mock
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
};
