/* IMPORTS */
const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {

    //Get token by headers access with array authorization
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    console.log("token do usuário que é gerado ao logar na aplicação", token);
    if(!token) {
        res.status(401).json({ msg: 'Acesso negado!' })
        return
    }

    try {

        const secret = process.env.SECRET
        console.log("secret do env", secret);
        const data = jwt.verify(token, secret)
        req.user_id = data.id
        // console.log(data);
        

        next()

    } catch(error) {
        res.status(400).json({ msg: 'Token inválido!' })
    }

}

module.exports = {
    checkToken
}