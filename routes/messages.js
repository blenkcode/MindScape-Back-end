const express = require("express");
const router = express.Router();
require("../models/connection");
const User = require("../models/users");
const Project = require("../models/projects");

router.post("/createProject", (req, res) => {
  const { name, ownerToken, memberIds } = req.body;

  User.findOne({ token: ownerToken }) // Trouvez l'utilisateur par son token
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }

      const ownerId = user._id;

      const newProject = new Project({
        name: name,
        owner: ownerId,
        members: memberIds,
      });

      return newProject.save().then((newDoc) => {
        // Ajouter le projet au propriétaire
        return User.findByIdAndUpdate(
          ownerId,
          { $push: { projects: newDoc._id } },
          { new: true }
        )
          .then(() => {
            // Ajouter le projet aux membres
            return User.updateMany(
              { _id: { $in: memberIds } },
              { $push: { projects: newDoc._id } }
            );
          })
          .then(() => newDoc); // Retourner le nouveau document de projet
      });
    })
    .then((newDoc) => {
      res.json({ result: true, data: newDoc });
    })
    .catch((error) => {
      console.error("Error creating project:", error);
      res.status(500).json({ result: false, error: "Error creating project" });
    });
});

router.get("/getAllProjects/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .populate("projects") // Popule le champ projects
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }
      res.json({
        result: true,
        projects: user.projects,
      });
    })
    .catch((error) => {
      console.error("Error fetching projects:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

// ajout // modif de tasks cards
router.put("/updateTask/:projectID", async (req, res) => {
  const projectID = req.params.projectID;
  const { tasks } = req.body; // Récupérer les tâches à partir du corps de la requête

  try {
    // Mettre à jour le projet avec les nouvelles tâches
    const updatedProject = await Project.findByIdAndUpdate(
      projectID,
      { tasks },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }

    res.json({
      result: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// recuperer les tasks depuis la bdd :

router.get("/getProjectTasks/:projectID/tasks", async (req, res) => {
  const projectID = req.params.projectID;

  try {
    const project = await Project.findById(projectID).select("tasks");

    if (!project) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }

    res.json({
      result: true,
      tasks: project.tasks,
    });
  } catch (error) {
    console.error("Error retrieving project tasks:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// update events
router.put("/updateEvents/:projectID", (req, res) => {
  const projectID = req.params.projectID;
  const { events } = req.body; // Récupérer les événements à partir du corps de la requête

  if (!events || typeof events !== "object") {
    return res
      .status(400)
      .json({ result: false, error: "Invalid events format" });
  }

  Project.findByIdAndUpdate(
    projectID,
    { events },
    { new: true, runValidators: true }
  )
    .then((updatedProject) => {
      if (!updatedProject) {
        return res
          .status(404)
          .json({ result: false, error: "Project not found" });
      }
      res.json({ result: true, project: updatedProject });
    })
    .catch((error) => {
      console.error("Error updating project:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

router.get("/getProjectsEvents/:projectID", async (req, res) => {
  const projectID = req.params.projectID;

  try {
    const project = await Project.findById(projectID).select("events");

    if (!project) {
      return res
        .status(404)
        .json({ result: false, error: "Project not found" });
    }

    res.json({
      result: true,
      events: project.events,
    });
  } catch (error) {
    console.error("Error retrieving project event:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
