const express = require('express');
const { memberController } = require('../../controllers');
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const auth = require('../../middlewares/auth');
const chewckAuth = require('../../middlewares/memberAuth');
const UPLOADS_FOLDER_USERS = "./public/uploads/members";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();


// ✅ for admin 
router.post('/add-member', auth("commonForAdmin"), memberController.createMember);
router.get('/all/members', auth("commonForAdmin"), memberController.getAllMembers);
router.patch('/:id', auth("commonForAdmin"), memberController.updateMember);

router.get('/:id', auth("commonForAdmin"), memberController.getSingleMemberAsAdmin);
router.get('/all/manager', auth("commonForAdmin"), memberController.getAllManager);
router.get('/all/customer', auth("commonForAdmin"), memberController.getAllCustomer);



//✅ for customer and manager
router.get('/customer/profile', chewckAuth('customer'), memberController.getSingleMember);
router.patch('/update/customer', chewckAuth("customer"), uploadUsers.single('profileImage'), memberController.updateMembersAsUser);

router.get('/manager/profile', chewckAuth('manager'), memberController.getSingleMember);
router.patch('/update/manager', chewckAuth("manager"), uploadUsers.single('profileImage'), memberController.updateMembersAsUser);


// ✅ Login routes
router.post('/auth/login', memberController.login);

module.exports = router;
