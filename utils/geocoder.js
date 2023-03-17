const NodeGeocoder = require('node-geocoder')

const options ={
    provider:"mapquest",
    httpAdapter:'https',
    apiKey:"pLqBe3cre4806FbkTqG5sfLSZI1fZlgf",
    formatter:null
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder
