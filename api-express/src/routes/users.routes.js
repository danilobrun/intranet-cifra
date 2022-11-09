
const { checkToken } = require("../middleware/checktoken");
const { getUserById, createUser, loginUser, listUsers, deleteUser, editUser } = require("../presentation/controllers/users.controller");

const usersRoutes = (app) => {

    app.get('/users', listUsers);
    app.get('/user/:id', checkToken, getUserById);
    app.post('/auth/register', createUser);
    app.post('/auth/login/', loginUser)
    app.delete('/user/:id', deleteUser)
    app.put('/user/:id', checkToken, editUser)
}


module.exports = usersRoutes

