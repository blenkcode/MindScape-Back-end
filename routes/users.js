var express = require("express");

var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//inscription

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["name", "email", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  User.findOne({ email: req.body.email })
    .then((data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          token: uid2(32),
        });

        newUser
          .save()
          .then((newDoc) => {
            res.json({
              result: true,
              token: newDoc.token,
              name: newDoc.name,
              _id: newDoc._id,
            });
          })
          .catch((error) => {
            res.json({ result: false, error: "Error saving user" });
          });
      } else {
        res.json({ result: false, error: "User already exists" });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: "Database error" });
    });
});

//connexion
router.post("/signin", (req, res) => {
  // if (!checkBody(req.body, ["email", "password"])) {
  //   res.json({ result: false, error: "Missing or empty fields" });
  //   return;
  // }

  User.findOne({ email: req.body.emailLogin }).then((data) => {
    if (data && bcrypt.compareSync(req.body.passwordLogin, data.password)) {
      res.json({
        result: true,
        data: data,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

//ajouter collaborateur

router.put("/addContact/:token", async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    const userEmails = Array.isArray(req.body.userEmail)
      ? req.body.userEmail
      : [req.body.userEmail];

    const validContacts = [];

    // Vérifier si chaque email est utilisé par un autre utilisateur
    for (const email of userEmails) {
      const otherUser = await User.findOne({ email });

      if (otherUser && otherUser._id.toString() !== user._id.toString()) {
        validContacts.push({
          email,
          name: otherUser.name,
          userId: otherUser._id,
        });
      }
    }

    // Vérifier si des emails valides ont été trouvés
    if (validContacts.length === 0) {
      return res.status(400).json({
        result: false,
        error: "Aucun utilisateur associé à cet email",
      });
    }

    const updatedContacts = [...user.contacts, ...validContacts];

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        contacts: updatedContacts,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    res.json({
      result: true,
      user: updatedUser,
      success: "Collaborateur ajouté à la liste des contacts",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

//delete un contact :
router.delete("/deleteContact/:contactID/:token", async (req, res) => {
  const contactID = req.params.contactID;
  const token = req.params.token;

  try {
    // Vérifier d'abord si l'utilisateur existe
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Mettre à jour les contacts de l'utilisateur
    await User.updateOne(
      { token },
      { $pull: { contacts: { userId: contactID } } }
    );

    // Vérifier si le contact a été supprimé

    const deletedContact = user.contacts.some(
      (contact) => contact.userId.toString() === contactID
    );

    if (!deletedContact) {
      return res
        .status(404)
        .json({ result: false, error: "Contact not found" });
    }

    res.json({
      result: true,
      message: "Contact successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ result: false, error: error.message });
  }
});

// route get pour recuperer infos du user

router.get("/:token", (req, res) => {
  const token = req.params.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
      }
      res.json({
        result: true,
        data: user.contacts, // Renvoie les données utilisateur sous le champ 'data'
      });
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      res.status(500).json({ result: false, error: error.message });
    });
});

module.exports = router;
