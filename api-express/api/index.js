/* IMPORTS */
require("dotenv").config();
var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const registersRoutes = require("../src/routes");
const port = process.env.PORT || 3002;

const app = express();

// O Cors serve para liberar requisições externas (portas diferente).
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
    `mongodb://${dbUser}:${dbPassword}@ac-7jao8bw-shard-00-00.1iksmgz.mongodb.net:27017,ac-7jao8bw-shard-00-01.1iksmgz.mongodb.net:27017,ac-7jao8bw-shard-00-02.1iksmgz.mongodb.net:27017/?ssl=true&replicaSet=atlas-cbwbup-shard-0&authSource=admin&appName=IntranetCifra`,
  )
  .then(() => {
    app.listen(port);
    console.log(`Conectou ao banco, na porta: ${port}`);
  })
  .catch((err) => console.log(err));
