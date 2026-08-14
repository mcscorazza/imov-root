const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.get('/trips', tripController.getTrips);
router.get('/map/:batch_id', tripController.getMap);
router.get('/alerts/:batch_id', tripController.getAlerts);
router.get('/chart/full/:batch_id', tripController.getFullChart);
router.get('/chart/:batch_id/:parquet_ref', tripController.getSegmentChart);

module.exports = router;