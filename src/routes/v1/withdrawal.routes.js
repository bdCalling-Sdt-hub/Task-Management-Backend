const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const withdrawalController = require("../../controllers/withdrawal.controller");

const router = express.Router();

router.route("/my").get(auth("employee"), withdrawalController.getSingleUserWithdrawals);
router
  .route("/")
  .get(withdrawalController.getWithdrawals)
  .post(auth("employee"), withdrawalController.createWithdrawal);

router
  .route("/:withdrawalId")
  .patch(auth("common"), withdrawalController.withdrawalCancel)
  .post(auth("common"), withdrawalController.withdrawalApprove)
  

module.exports = router;
