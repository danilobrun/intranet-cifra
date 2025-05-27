const mongoose = require("mongoose");
const Portal = require("../models/Portal");

const main = async () => {
  await mongoose.connect("mongodb://localhost:27017/seubanco"); // substitua com sua string de conexão

  await Portal.updateMany(
    {
      $or: [
        { baseLink: { $exists: false } },
        { updateSchedule: { $exists: false } },
      ],
    },
    {
      $set: {
        baseLink: "",
        updateSchedule: "",
      },
    }
  );

  console.log("Documentos de Portal atualizados.");
  await mongoose.disconnect();
};

main().catch(console.error);
