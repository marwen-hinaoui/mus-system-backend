
const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const authMiddleware = require('../middleware/authMiddleware'); // Optional

// Public routes (no auth required for getting all/by ID in this example)
router.get('/', demandeController.getDemandes);
router.get('/:id', demandeController.getDemandeById);

// Routes that require authentication (example)
router.post('/', authMiddleware, demandeController.createDemande); // Apply auth middleware
// router.put('/:id', authMiddleware, demandeController.updateDemande);
// router.delete('/:id', authMiddleware, demandeController.deleteDemande);

module.exports = router;