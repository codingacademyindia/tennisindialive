const express = require('express');
const router = express.Router();
const tennisController = require('../controllers/tennisControllers');

// Define routes
router.get('/rankings/wta/live', tennisController.getWtaLiveRankings);
router.get('/rankings/atp/live', tennisController.getAtpLiveRankings);
router.get('/rankings/wta', tennisController.getWtaCurrentRankings);
router.get('/rankings/atp', tennisController.getAtpCurrentRankings);
router.get('/scores', tennisController.getAllScores);

module.exports = router;
