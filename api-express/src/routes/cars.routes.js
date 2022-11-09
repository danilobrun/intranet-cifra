const { checkToken } = require("../middleware/checktoken");
const { listCars, getCarById, createCar, deleteCar, editCar } = require("../presentation/controllers/cars.controller")

const carsRoutes = (app) => {
    
    app.get('/listcars', listCars);
    app.get('/listcars/:id', checkToken, getCarById);
    app.post('/listcars/auth/register', checkToken, createCar);
    app.delete('/listcars/:id', checkToken, deleteCar);
    app.put('/listcars/:id', checkToken, editCar)
}


module.exports = carsRoutes

// app.get('/users', listUsers);
// app.get('/user/:id', checkToken, getUserById);
// app.post('/auth/register', createUser);
// app.post('/auth/login/', loginUser)
// app.delete('/user/:id', deleteUser)
// app.put('/user/:id', checkToken, editUser)