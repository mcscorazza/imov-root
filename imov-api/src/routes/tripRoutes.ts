import { Router } from "express";
import tripController from "../controllers/tripController.js";

const router = Router();

router.get("/trips", tripController.getTrips);
router.get("/map/:batch_id", tripController.getMap);
router.get("/alerts/:batch_id", tripController.getAlerts);
router.get("/chart/full/:batch_id", tripController.getFullChart);
router.get("/chart/:batch_id/:parquet_ref", tripController.getSegmentChart);

export default router;
