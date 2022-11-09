// IMPORTS
const mongoose = require('mongoose')

// Acesssos e proriedades dessa classe
const Car = mongoose.model('Car', {
    name: String,
    brand: String,
    model: String,
    year: Number,
    transmission: String,
    engine: String,
    color: String,
    door: String,
    license_plate: String,
    createdAt: Date,
    updatedAt: Date

})

// EXPORTS
module.exports = Car