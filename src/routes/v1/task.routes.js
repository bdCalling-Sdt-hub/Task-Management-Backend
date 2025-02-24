const express = require('express');
const taskController = require('../../controllers/task.controller');
const auth = require('../../middlewares/auth');
const chewckAuth = require('../../middlewares/memberAuth');
const router = express.Router();

router.post('/create-task', auth("commonForAdmin"), taskController.createTask);
router.patch('/update-task/:id', auth("commonForAdmin"), taskController.updateTaskAdmin);
router.delete('/delete-task/:id', auth("commonForAdmin"), taskController.deleteTaskAdmin);

router.get('/single-task/:id', auth("commonForAdmin"), taskController.getSingleSubTaskById);
router.get('/task/:id', auth("commonForAdmin"), taskController.getSingleTaskById);

router.delete('/single-task/:id', auth("commonForAdmin"), taskController.deleteSingleSubTaskById);
router.get('/my-task/:userID', auth("commonForAdmin"), taskController.getSingleTask);
router.get('/all', auth("commonForAdmin"), taskController.getAllTasks);

router.get('/task-from-manager', auth("commonForAdmin"), taskController.getAllTaskFromManager);


// Sub-task routes

router.get('/weekly-task/customer', chewckAuth("customer"), taskController.getSingleSubTask);
router.get('/daily-task/customer', chewckAuth("customer"), taskController.getSingleDailySubTask);
router.get('/all/sub-task/:id', auth("common"), taskController.getAllSubTask);
router.post('/sub-task', auth("common"), taskController.createSubTask);

// router.patch('/sub-task/:id', auth("commonForAdmin"), taskController.updateSubTask);
router.post('/sub-task-to-manager', chewckAuth("customer"), taskController.postTaskToManager);

router.get('/all/sub-task/manager/:id', chewckAuth("manager"), taskController.getAllSubTask);


router.patch('/update-task', auth("common"), taskController.updateManyTask);


// admin routes
router.get('/task-request-manager', auth("commonForAdmin"), taskController.getAllTaskRequestToManager);


router.get('/task-submited-customer', chewckAuth("manager"), taskController.getAllTaskSubmitedToManager);
router.patch('/customer-viewed', chewckAuth("manager"), taskController.getAllTaskViewedToManager);
router.patch('/manager/update-task', chewckAuth("manager"), taskController.updateManyTaskSubmited);
router.get('/customer-task-search/:userId', chewckAuth("manager"), taskController.getAllTaskSearchToManager);
router.get('/manager/customer/all', chewckAuth("manager"), taskController.getAllCustommerForManager);
router.post('/make-pdf', chewckAuth("manager"), taskController.generatePdfForManager); // by using pdfkit

router.post('/manager/task-submit-to-admin/:id', chewckAuth("manager"), taskController.submitAllTaskSubmitToAdmin);


module.exports = router;


