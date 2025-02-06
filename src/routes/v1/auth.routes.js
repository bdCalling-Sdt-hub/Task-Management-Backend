const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middlewares/auth');
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);


const router = express.Router();


// ============== Admin related routes ===============

router.post('/login', validate(authValidation.login), authController.login);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', auth('common'), validate(authValidation.changePassword), authController.changePassword);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/delete-me', auth('user'), validate(authValidation.deleteMe), authController.deleteMe);


//=============== sub Admins realted routes ===============

router.post('/sub-admin', auth('admin'), validate(authValidation.register), authController.register);
router.get('/all-admins', auth('admin'), authController.getAllAdmins)
router.get('/all-block-admins', auth('admin'), authController.getAllBlockAdmins)
router.patch('/block/:id', auth('admin'), authController.blockUser)
router.get('/:id', auth('commonForAdmin'), authController.getAdmin)
router.patch('/update/:id', auth('commonForAdmin'), authController.editUser)

module.exports = router;

