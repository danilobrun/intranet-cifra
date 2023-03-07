/* Imports */
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import express from "express";
require("dotenv").config();
var cors = require("cors");
const mongoose = require("mongoose");
const registersRoutes = require("./src/routes");
const port = process.env.PORT || 3002;

// Test conection
// const PORT = process.env.PORT_HOST;

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

console.log(port);

// Express
const start = async () => {
  const adminOptions = {
    rootPath: "/admin",
    dashboard: {},
    branding: {
      logo: "https://cifraengenharia.com.br/wp-content/uploads/2018/08/logo-site.png",
      favicon:
        "https://cifraengenharia.com.br/wp-content/uploads/2021/05/cropped-icon2-32x32.png",
      companyName: "Cifra Engenharia",
    },
  };
  const app = express();
  //instaciar o adminJS
  const admin = new AdminJS(adminOptions);
  //criando a rota /admin como parametro nós injetamos o AdminJS
  const adminRouter = AdminJSExpress.buildRouter(admin);
  //executando nosso express (param1: opções para receber rota, retorna um obj que seja executado: nossa Rota)
  //ou seja queremos que quando ele entre em nosso adminRouter que será executado? nosso adminRouter é uma função
  //como parâmetro ela recebe admin ou seja quem é adminRouter é o nosso cara AdminJS

  // O Cors serve para liberar requisições externas (portas diferente)
  app.use(cors());

  // Config JSON response middleware
  app.use(express.json());

  // Todas as nossa rotas
  registersRoutes(app);

  let err: any;

  // Connect method Mongo DB
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => {
      app.listen(port);
      console.log(`Conectou ao banco, na porta: ${port}`);
    })
    .catch(() => console.log(err));
  app.use(admin.options.rootPath, adminRouter);
};

start();
