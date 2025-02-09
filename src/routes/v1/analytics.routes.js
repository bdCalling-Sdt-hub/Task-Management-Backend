const express = require("express");
const auth = require("../../middlewares/auth");
const { analyticsController } = require("../../controllers");
const chewckAuth = require("../../middlewares/memberAuth");

const router = express.Router();


router.get("/weekly", chewckAuth("customer"), analyticsController.getTasksAnalyticsWeeklyAndMonthly);


module.exports = router;