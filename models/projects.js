const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
  id: String, // Ajoutez un ID pour les cartes si nécessaire
  name: String,
  color: String,
});
const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  contentType: String,
  size: Number,
});

const projectsSchema = new mongoose.Schema({
  name: String,

  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence au propriétaire du projet
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Références aux membres du projet
  createdAt: { type: Date, default: Date.now },

  tasks: {
    section1: [taskSchema],
    section2: [taskSchema],
    section3: [taskSchema],
  },
  events: [{ event: String, date: String }],
  files: [fileSchema],
});

const Projects = mongoose.model("Project", projectsSchema);

module.exports = Projects;
