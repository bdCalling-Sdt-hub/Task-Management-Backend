const express = require("express");
const adminController = require("../../controllers/admin.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router
    .route("/add")
    .post(auth("admin"), adminController.createAdmin);

router
    .route("/all")
    .get(auth("admin"), adminController.getAllAdmins);

router
    .route("/update/:id")
    .patch(auth("admin"), adminController.updateAdmin);

router
    .route("/block/:id")
    .patch(auth('admin'), adminController.blockAdmin);


router
    .get("/:email", adminController.getAdminByEmail);

module.exports = router;
