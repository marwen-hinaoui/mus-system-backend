
const Demande = require('../models/demandeModel');

exports.createDemande = async (req, res, next) => {
    try {
        const newDemandeId = await Demande.create(req.body);
        res.status(201).json({ message: 'Demande created successfully', id: newDemandeId });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

exports.getDemandes = async (req, res, next) => {
    try {
        const demandes = await Demande.getAll();
        res.status(200).json(demandes);
    } catch (error) {
        next(error);
    }
};

exports.getDemandeById = async (req, res, next) => {
    try {
        const demande = await Demande.getById(req.params.id);
        if (!demande) {
            return res.status(404).json({ message: 'Demande not found' });
        }
        res.status(200).json(demande);
    } catch (error) {
        next(error);
    }
};

// controller methods to add (updateDemande, deleteDemande...)