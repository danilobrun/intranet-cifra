const { checkToken } = require('../middleware/checktoken')
const { rentCar, rentsGet, rentCars, editRent, deleteRent } = require('../presentation/controllers/rents.controller')

const rentsRoutes = (app) => {

    app.get('/rentcars/', rentCars); //Listar tabela de carros alugados
    app.post('/rentcar/:id', checkToken, rentCar); //Alugar um carro
    app.get('/rentscars/:id', checkToken, rentCar);
    app.get('/rents/:id', checkToken, rentsGet); //Retorno a tabela de alugueis com join na tabela de Users
    app.delete('/rents/:id', checkToken, deleteRent) //Excluir um aluguel
    app.put('/rentcar/:id', checkToken, editRent) //Atualiza aluguel
}


module.exports = rentsRoutes