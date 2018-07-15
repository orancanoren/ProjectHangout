var config = {
    entry:  {
        index: './react/Index.jsx',
        auth: './react/Authenticated.jsx'
    },
     
    output: {
       path: __dirname + '/public/js/',
       filename: '[name]-react.js',
    },
     
    module: {
       loaders: [
          {
             test: /\.jsx?$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
                 
             query: {
                presets: ['es2015', 'react']
             }
          }
       ]
    }
 }
 
 module.exports = config;