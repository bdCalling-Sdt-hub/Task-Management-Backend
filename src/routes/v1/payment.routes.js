const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const paymentController = require("../../controllers/payment.controller");

const router = express.Router();

router.route("/status").get(paymentController.allStatus);
router.route("/chart").get(paymentController.paymentChart);
router
  .route("/")
  .post(auth("employee"), paymentController.processPayment)
  .get(auth("admin"), paymentController.getPayments);

router.route("/:paymentId").get(auth("common"), paymentController.getPayment);

module.exports = router;
