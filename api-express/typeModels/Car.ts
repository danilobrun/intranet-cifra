import { model, Schema, Types } from "mongoose";

export interface ICategory {
  name: string;
  brand: string;
  model: string;
  transmission: string;
  engine: string;
  color: string;
  door: string;
  license_plate: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = new Schema<ICategory>({
  name: { type: "String", required: true },
  brand: { type: "String", required: true },
  model: { type: "String", required: true },
  year: { type: "Number", required: true },
  transmission: { type: "String", required: true },
  engine: { type: "String", required: true },
  color: { type: "String", required: true },
  door: { type: "String", required: true },
  license_plate: { type: "String", required: true },
  createdAt: { type: "Date", required: true },
  updatedAt: { type: "Date", required: true },
});

export const Category = model<ICategory>("Category", CategorySchema);

// // IMPORTS
// const mongoose = require('mongoose')

// // Acesssos e proriedades dessa classe
// const Car = mongoose.model('Car', {
//     name: {"String", required: true},
//     brand: {"String" required: true},
//     model: {"String" required: true},
//     year: {"Number" required: true},
//     transmission:{ "String" required: true},
//     engine: {"String" required: true},
//     color: {"String" required: true},
//     door: {"String" required: true},
//     license_plate: {"String" required: true},
//     createdAt: {"Date" required: true},
//     updatedAt: {"Date" required: true}

// })

// // EXPORTS
// module.exports = Car
