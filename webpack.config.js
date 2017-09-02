var config = {
    entry: './react/App.js',
     
    output: {
       path: __dirname + '/public/js/',
       filename: 'react-app.js',
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