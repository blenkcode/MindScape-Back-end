const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  email: String,
  name: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  contacts: [contactSchema],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }], // Définition correcte pour un tableau d'objets
});

const User = mongoose.model("User", userSchema);

module.exports = User;
