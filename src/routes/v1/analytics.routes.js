const express = require("express");
const auth = require("../../middlewares/auth");
const { analyticsController } = require("../../controllers");

const router = express.Router();


router.get("/:email", auth("common"), analyticsController.getTasksAnalyticsWeeklyAndMonthly);


module.exports = router;