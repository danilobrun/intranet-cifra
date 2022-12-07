/* IMPORTS */
require("dotenv").config();
var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const registersRoutes = require("../src/routes");
const port = process.env.PORT || 3002;

const app = express();

// O Cors serve para liberar requisições externas (portas diferente)
app.use(cors());

// Config JSON response middleware
app.use(express.json());

// Todas as nossa rotas
registersRoutes(app);

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

console.log(`user ${dbUser}, pass ${dbPassword}`);

// Connect method Mongo DB
mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
    console.log(`Conectou ao banco, na porta: ${port},`);
  })
  .catch((err) => console.log(err));
