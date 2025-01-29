const express = require("express");
const auth = require("../../middlewares/auth");
const notificationController = require("../../controllers/notification.controller");

const router = express.Router();

router.route("/").get(auth("common"), notificationController.getALLNotification);

router
  .route("/:id")
  .post(notificationController.readNotification)
  .delete(notificationController.deleteNotificationById);
router.route("/admin").get(auth("admin"), notificationController.getALLNotificationAdmin)
      // .post(auth("admin"), notificationController.readNotificationAdmin)

module.exports = router;
