const carsRoutes = require("./cars.routes");
const rentsRoutes = require("./rent.cars.routes");
const usersRoutes = require("./users.routes")
// const carsRoutes = require("./cars.routes")

const registersRoutes = (app) => {

    app.get('/', (req, res) => {
        res.status(200).json({ msg: 'Bem vindo a Rent a Car sua melhor solução em aluguel de carro!' })
    });
    carsRoutes(app);
    usersRoutes(app);
    rentsRoutes(app)

}


module.exports = registersRoutes
