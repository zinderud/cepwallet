import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'development',
  entry: './packages/desktop/src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'packages/desktop/src')
    }
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './packages/desktop/src/renderer/index.html'
    })
  ]
};
