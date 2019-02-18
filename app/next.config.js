if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: require('path').resolve(process.cwd(), '../.env')
  })
}

module.exports = {
  env: {
    API_URL: process.env.API_URL || '/api'
  }
}
