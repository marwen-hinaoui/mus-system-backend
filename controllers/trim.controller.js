const site = require("../models/site");
<<<<<<< HEAD
const projet = require("../models/projet");
const lieuDetection = require("../models/lieuDetection");

const getProjects = async (req, res) => {
  try {
    const projects = await projet.findAll();
    res.status(200).json({ data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};
=======
const lieuDetection = require("../models/lieuDetection");
const fonction = require("../models/fonction");
>>>>>>> f0b04cf8fceaa955e98b9e9d15bfe0848ff6bf0a

const getSites = async (req, res) => {
  try {
    const sites = await site.findAll();
    res.status(200).json({ data: sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLieuDetection = async (req, res) => {
  try {
    const lieux = await lieuDetection.findAll();
    res.status(200).json({ data: lieux });
  } catch (error) {
    console.error("Error fetching lieux:", error);
    res.status(500).json({ message: "Server error" });
  }
};

<<<<<<< HEAD
module.exports = { getProjects, getSites, getLieuDetection };
=======
const getFonction = async (req, res) => {
  try {
    const fontionsFromDB = await fonction.findAll();
    res.status(200).json({ data: fontionsFromDB });
  } catch (error) {
    console.error("Error fetching lieux:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSites, getLieuDetection, getFonction };
>>>>>>> f0b04cf8fceaa955e98b9e9d15bfe0848ff6bf0a
