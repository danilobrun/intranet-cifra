// IMPORTS
const mongoose = require('mongoose')

// Acesssos e propriedades dessa classe
const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    createdAt: Date,
    updatedAt: Date
})

// EXPORTS
module.exports = User