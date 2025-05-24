import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    background: './src/background.ts',
    chunkLoading: 'import-scripts', // moved here
  },
  output: {
    path: path.resolve(__dirname, 'build_2.0'),
    filename: '[name].js'
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
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

export default config;
