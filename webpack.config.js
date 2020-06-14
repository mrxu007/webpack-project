const {resolve} = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
//这项设置用于兼容css处理,让bowerslist去读取当前环境，并做出兼容处理
//webpack.config.js中的mode设置不与当前设置的环境冲突。只为了适配bowerslist配置
process.env.NODE_ENV = 'development';
module.exports = {
  //注意数组形式的写法，不是多入口文件，而是将后者合并到前者
  //多入口文件需采用对象的方式
  //这里这么写是为了解决开启HMR功能导致，html文件原有的热更新功能失效。
  entry: ['./src/js/index.js', './src/index.html'],//文件入口
  output: {//文件输出
    filename: 'js/bundle.[hash:8].js',
    path: resolve(__dirname, 'dist'),
    publicPath: ''
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
              limit: 1 * 1024,//用于base64转换，base64图片不会请求http，减少小体积图片的请求。
              //大于这个限制的图片使用依赖file-loader解析图片
              outputPath: 'images/',
              publicPath: '../images',
              //因为打包后抽离插件的影响，css中所引用的图片相对地址发生了改变，所以要设置这项
              name: '[hash:8].[ext]'
            }
          }
        ]
      },
      {//elint处理js
        enforce: 'pre',//强制这个loader比下面loader先执行，我们都知道loader从下往上，从右往左,
        //记住啊 这个bug找了一下午，elint和babel在抢js文件
        test: /\.js$/,
        exclude: /node_modules/,
        include: resolve(__dirname, 'src'),
        use: {
          loader: 'eslint-loader',
          options: {
            // enforce: 'pre',   千万别把enforce放这里，血的教训
            fix: true//强大的属性帮我们自动改正错误的格式！！
          }
        }
      },
      {//es6高级语法转es5
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
          'style-loader',
          // MiniCssExtractPlugin.loader,
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
          'style-loader',
          // MiniCssExtractPlugin.loader,
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
          'style-loader', 
          //抽离css功能请在生产模式再开启，不然会与HMR功能冲突
          // MiniCssExtractPlugin.loader,
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
    //抽离css功能请在生产模式再开启，不然会与HMR功能冲突
    // new MiniCssExtractPlugin({//css抽离
    //   //对输出的css文件进行分、重命名
    //   filename: 'css/bundle.[hash:8].css',
    // }),
    // new OptimizeCssAssetsWebpackPlugin()//css代码压缩
  ],
  mode: 'development',//运行模式
  // mode: 'production',
  // devtool: 'source-map',//映射源代码/，用于上线环境的调试
  externals: {//忽略外部引入的库，作用：这个库将不会被打包
    jquery: 'jQuery'
  },
  devServer: {//本地运行服务器配置
    contentBase: resolve(__dirname, 'dist'),//解析文件地址
    compress: true,//打开gzip压缩
    port: 3000,//端口号
    // open: true,//自动打开浏览器
    //开启HMR: 热模块替换：一个模块发生变化，只会重新打包这个模块(而不是打包所有模块)
    hot: true
  }
}