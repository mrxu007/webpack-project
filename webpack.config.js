const {resolve} = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
  entry: './src/js/index.js',//文件入口
  output: {//文件输出
    filename: 'js/bundle.[hash:8].js',
    path: resolve(__dirname, 'dist')
  },
  module: {//模块
    rules: [
      {//处理文字图片
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        exclude: resolve(__dirname,'src/images'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[hash:8].[ext]',
            outputPath: 'font/'
          }
        }
      },
      {//处理html中的img图片
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
            //识别html文件中的img标签
          }
        ]
      },
      {//处理import导入的图片
        test: /\.(gif|png|jpeg|svg|jpg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8 * 1024,//用于base64转换，base64图片不会请求http，减少小体积图片的请求。
              //大于这个限制的图片使用依赖file-loader解析图片
              outputPath: 'images/',
              publicPath: '../../dist/images',
              //因为打包后抽离插件的影响，css中所引用的图片相对地址发生了改变，所以要设置这项
              name: '[hash:8].[ext]'
            }
          }
        ]
      },
      {//elint处理js
        test: /\.js$/,
        exclude: /node_modules/,
        include: resolve(__dirname, 'src'),
        use: {
          loader: 'eslint-loader',
          options: {
            enforce: 'pre',//强制这个loader比下面loader先执行，我们都知道loader从下往上，从右往左
            fix: true//强大的属性帮我们自动改正错误的格式！！
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,//依赖库不需要进行转换
        include: resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {//处理styl文件
        test: /\.styl/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')
                //帮助postcss-loader去找package.json文件中的browserlist兼容主流浏览器配置
              ]
            }
          },
          'stylus-loader'
        ]
      },
      {//处理less
        test: /\.less$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')
                //帮助postcss-loader去找package.json文件中的browserlist兼容主流浏览器配置
              ]
            }
          },
          'less-loader'
        ]
      },
      {//处理css
        test: /\.css$/,
        use:[
          // 'style-loader', 
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')
                //帮助postcss-loader去找package.json文件中的browserlist兼容主流浏览器配置
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [//插件
    new CleanWebpackPlugin(),//清楚上一个打包的文件残留
    new HtmlWebpackPlugin({//html文件处理
      template: './src/index.html',//模板文件
      filename: 'index.html',//打包后的名字
      //html上线优化设置
      // minify: {//压缩
      //   removeAttributeQuotes: true,//移除属性之间的引号
      //   collapseWhitespace: true,//折叠空格
      // },
      // hash: true//插入的js尾部生成hash戳
    }),
    new MiniCssExtractPlugin({//css抽离
      //对输出的css文件进行分、重命名
      filename: 'css/bundle.[hash:8].css',
    }),
    new OptimizeCssAssetsWebpackPlugin()//css代码压缩
  ],
  mode: 'development',//运行模式
  // mode: 'production',
  // devtool: 'source-map',//映射源代码/，用于上线环境的调试
  externals: {//外部引入配置
    jquery: 'jQuery'
  },
  devServer: {//本地运行服务器配置
    contentBase: resolve(__dirname, 'dist'),//解析文件地址
    compress: true,//打开gzip压缩
    port: 8080,//端口号
    open: true//自动打开浏览器
  }
}