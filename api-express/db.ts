import mongoose from "mongoose";
require("dotenv").config();

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Connect method Mongo DB
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@intranetcifra.1iksmgz.mongodb.net/?retryWrites=true&w=majority`
);

const mongoDb = mongoose.connection;

export { mongoDb };
