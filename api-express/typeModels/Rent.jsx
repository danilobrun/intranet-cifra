// IMPORTS
const mongoose = require('mongoose')

// Acesssos e proriedades dessa classe
const Rent = mongoose.model('Rent', {
    car_id: String,
    user_id: String, 
    createdAt: Date,
    updatedAt: Date
})

// EXPORTS
module.exports = Rent