const Car = require("../../../models/Car");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/* IMPORTS */
require("dotenv").config();

const listCars = async (req, res) => {

    const cars = await Car.find()

    res.status(200).json(cars)
}

// Private Route - Only Logged Users
const getCarById = async (req, res) => {

    const id = req.params.id

    // Check if car exists
    const car = await Car.findById(id, '-password')

    if(!car) {
        res.status(404).json({ msg: 'Carro não encontrado!' })
    }

    res.status(200).json({ car })
}

// Resgiter Car
const createCar = async (req, res) => {
    const { name, brand, model, year, transmission, engine, color, door, license_plate } = req.body

    // Validations
    if(!name) {
        return res.status(422).json({ msg: 'Favor informar o nome do carro!'})
    }
    if(!brand) {
        return res.status(422).json({ msg: 'Favor informar a marca do carro!'})
    }
    if(!model) {
        return res.status(422).json({ msg: 'Favor informar o modelo do carro!'})
    }
    if(!year) {
        return res.status(422).json({ msg: 'Favor informar o ano do carro!'})
    }
    if(!transmission) {
        return res.status(422).json({ msg: 'Favor informar o tipo de transmissão do carro!'})
    }
    if(!engine) {
        return res.status(422).json({ msg: 'Favor infomar a potência do motor do carro!'})
    }
    if(!color) {
        return res.status(422).json({ msg: 'Favor informar a cor do carro!'})
    }
    if(!door) {
        return res.status(422).json({ msg: 'Favor informar quantas portas possui o carro!'})
    }
    if(!license_plate) {
        return res.status(422).json({ msg: 'Favor informar a placa do carro!'})
    }

    // check if car exists
    const carExists = await Car.findOne({ license_plate: license_plate })

    if (carExists) {
        return res.status(422).json({ msg: `Carro de placa: ${license_plate} já cadastrado, favor cadastrar um novo carro.` })
    }

    // create car new Model
    const car = new Car({
        name,
        brand,
        model,
        year,
        transmission,
        engine,
        color,
        door,
        license_plate,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    try {
        // save into database
        await car.save()

        res.status(201).json({ msg: 'Carro registrado na base com sucesso!'})
        
    } catch (error) {
        console.log('error', error);

        res
        .status(500)
        .json({ 
            msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!'
        })
    }
}

// delete car by id
const deleteCar = async (req, res) => {

    const { id } = req.params
    console.log(`id do req.params.id: ${id}`);

    // validation check if car exists
    const carExists = await Car.findById({_id : id})

    if(!carExists) {
        return res.status(422).json({ msg: `carro de id:${id} não existe, favor informar um novo carro!`})
    }

    // action to delete
    try {

        const deletedCar = await Car.findByIdAndDelete({ _id : id })
        return res.status(200).json({ msg: `Carro deletado foi ${deletedCar}` })

    } catch (err) {
        return res.status(500).json({ msg: `Aconteceu um erro no servidor, tente novamente mais tarde.` })
    }
    
    
}

const editCar = async (req, res) => {

    const { id } = req.params
    const { name, brand, model, year, transmission, engine, color, door, license_plate  } = req.body
    console.log(`log do id da req: ${id}`);

    const carData = {
        id,
        name,
        brand,
        model,
        year,
        transmission,
        engine,
        color,
        door,
        license_plate
    }

    // check if car exists
    const carExists = await Car.findById({ _id : id })

    if(!carExists) {
        return res.status(422).json({ msg: `carro de id:${ id } não existe, favor informar um novo carro!`})
    }

    // update car
    try {
        const result = await Car.findByIdAndUpdate(carData.id, {
        name,
        brand,
        model,
        year,
        transmission,
        engine,
        color,
        door,
        license_plate

        })

        const listCarUpdated = await Car.findById(carData.id)
        console.log(listCarUpdated);
        return res.status(200).json({ msg: `
            Carro atualizado com sucesso!
            Antigo:
            ${result}
            
            Atual:
            ${listCarUpdated}
        `})
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!'})
    }

}

module.exports = { 
    listCars,
    getCarById,
    createCar,
    deleteCar,
    editCar
}