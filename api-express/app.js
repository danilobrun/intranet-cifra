/* IMPORTS */
require("dotenv").config();
var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const registersRoutes = require("./src/routes");

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

// Connect method Mongo DB
mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.zti1m9u.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3002);
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));
