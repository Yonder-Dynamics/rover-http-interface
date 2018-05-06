const path = require('path');

module.exports = {
  entry: {
    bundle:'./src/index.js',
    joystick:'./src/joystick.js',
  },
  output: {
    filename: '[name].js',
    //path: __dirname + '/dist'
    path: path.resolve(__dirname, 'dist')
  },
  module:{
    rules:[
      {
        test:/\.[fv]s$/,
        use:'raw-loader'
      }
    ]
  }
};
