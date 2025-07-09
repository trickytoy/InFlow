// webpack.background.config.js
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",
  devtool: "source-map",
  entry: {
    background: {
      import: "./src/background.ts",
      chunkLoading: "import-scripts", // <-- Critical!
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js", // outputs background.js
    //clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
};