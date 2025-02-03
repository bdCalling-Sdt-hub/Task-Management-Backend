const express = require('express');
const { memberController } = require('../../controllers');
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const auth = require('../../middlewares/auth');
const UPLOADS_FOLDER_USERS = "./public/uploads/members";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();

router.post('/add-member', auth("commonForAdmin"), memberController.createMember);
router.get('/:id', auth("commonForAdmin"), memberController.getSingleMember);
router.get('/all/members', auth("commonForAdmin"), memberController.getAllMembers);
router.patch('/:id', auth("commonForAdmin"), memberController.updateMember);

// ✅ Fix file upload route

router.patch('/update/:id', uploadUsers.single('profileImage'), memberController.updateMembersAsUser);


// Login routes
router.post('/auth/login', memberController.login);

module.exports = router;
