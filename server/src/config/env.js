require("dotenv").config();

if (!process.env.PORT) {
  throw new Error("El puerto no está definido");
}

module.exports = {
  port: process.env.PORT
};