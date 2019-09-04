const  path  =  require('path');
const  MiniCssExtractPlugin  =  require('mini-css-extract-plugin');
const  OptimizeCssAssetsPlugin  =  require('optimize-css-assets-webpack-plugin');
const  UglifyJsPlugin  =  require('uglifyjs-webpack-plugin');
const  HtmlWebpackPlugin  =  require('html-webpack-plugin');
const  {CleanWebpackPlugin}  =  require('clean-webpack-plugin');


module.exports  =  {
  entry:  './src/index.js',
  mode:  'development',
  output:  {
    filename:  'main.js',
    path:  path.resolve(__dirname,  'dist'),
  },
  module:  {
    rules: [
      {
        test: /\.(sc|c|sa)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader:"css-loader",
            options:{ sourceMap:  true  }
          },
          {
            loader:"postcss-loader",
            options:  {
              ident:  "postcss",
              sourceMap:  true,
              plugins:  loader  => [
                require('autoprefixer')(),
                // 这里可以使用更多配置，如上面提到的 postcss-cssnext 等
                // require('postcss-cssnext')()
              ]
            }
          },
          {
            loader:"sass-loader",
            options:{ sourceMap:  true  }
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        include: [path.resolve(__dirname,  'src/')],
        use: [
          // "file-loader",
          {
            loader:  'url-loader',  // 根据图片大小，把图片转换成 base64
            // options:  { limit:  10000  },
          },
          {
            loader:  "image-webpack-loader",
            options:  {
              mozjpeg:  { progressive:  true, quality:  65  },
              optipng:  { enabled:  false  },
              pngquant:  { quality:  '65-90', speed:  4  },
              gifsicle:  { interlaced:  false  },
              webp:  { quality:  75  }
            }
          },
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        include: [path.resolve(__dirname,  'src/')],
        use: [ 'file-loader' ]
      }
    ],
    noParse:  function(content){
      return /jquery|lodash/.test(content);
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:  '[name].css',  // 最终输出的文件名
      chunkFilename:  '[id].css'
    }),
    new OptimizeCssAssetsPlugin({}),
    new UglifyJsPlugin({
      cache:  true, // 当 JS 没有发生变化则不压缩
      parallel:  true, // 是否启用并行压缩
      sourceMap:  true // 是否启用 sourceMap
    }),
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname, 'views/index.html'),//本地模板文件的位置，支持加载器(如handlebars、ejs、undersore、html等)，如比如 handlebars!src/index.hbs；
      title: 'Webpack App',//生成的html文档的标题
      // chunks:["app"],//引入的a,b模块，这里指定的是entry中设置多个js时，在这里指定引入的js，如果不设置则默认全部引入,数组形式传入
      minify: {
          caseSensitive: false, //是否大小写敏感
          collapseBooleanAttributes: true, //是否简写boolean格式的属性如：disabled="disabled" 简写为disabled 
          collapseWhitespace: true //是否去除空格
      },
      chunksSortMode: "auto", //引入模块的排序方式
      //excludeChunks: ['a', 'b'], //排除的模块,引入的除a,b模块以外的模块，与chunks相反
      inject:true,//1、true或者body：所有JavaScript资源插入到body元素的底部2、head: 所有JavaScript资源插入到head元素中3、false： 所有静态资源css和JavaScript都不会注入到模板文件中
      showErrors:true,//是否将错误信息输出到html页面中
      hash:true,//是否为所有注入的静态资源添加webpack每次编译产生的唯一hash值
      minify: false,//传递 html-minifier 选项给 minify 输出
      favicon: "",//指定页面图标 favicon 路径到输出的 HTML 文件中。
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    publicPath: '/',//
    contentBase: path.resolve(__dirname, 'dist'),//此处的路径必须和输出output文件的路径一致 否则无法自动更新，或者是基于output的相对路径
    compress: true,
    historyApiFallback: true,//在开发单页应用时非常有用，它依赖于HTML5 history API，如果设置为true，所有的跳转将指向index.html
    inline: true,//设置为true，当源文件改变时会自动刷新页面
    // grogress: true,
    host: 'localhost',// 默认是localhost
    port: 9000,//指定用于侦听请求的端口号
    open:true,//当open启用时，开发服务器将打开浏览器。
    //hot: true,// 开启热更新，开启热加载还需在主入口js文件中配置
    // openPage:'index.html',//指定在打开浏览器时导航到的页面。
    overlay: {//当存在编译器错误或警告时，在浏览器中显示全屏覆盖,显示警告和错误：
        warnings: true,
        errors: true
    },
    proxy: {//代理配置
        '/api': {
            target: 'http://localhost:3000',
            pathRewrite: {'^/api' : ''},//如果不想/api传递，我们需要重写路径
        }
    },
    
}
}