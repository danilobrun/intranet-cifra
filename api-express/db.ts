import mongoose from "mongoose";
require("dotenv").config();

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;

// Connect method Mongo DB
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPassword}@cluster0.zti1m9u.mongodb.net/${dbHost}?retryWrites=true&w=majority`
);

const mongoDb = mongoose.connection;

export { mongoDb };
