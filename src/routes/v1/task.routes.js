const express = require('express');
const taskController = require('../../controllers/task.controller');
const auth = require('../../middlewares/auth');
const chewckAuth = require('../../middlewares/memberAuth');
const router = express.Router();

router.post('/create-task', auth("commonForAdmin"), taskController.createTask);
router.get('/my-task/:userID', auth("commonForAdmin"), taskController.getSingleTask);
router.get('/all', auth("commonForAdmin"), taskController.getAllTasks);


// Sub-task routes

router.get('/weekly-task/customer', chewckAuth("customer"), taskController.getSingleSubTask);
router.get('/daily-task/customer', chewckAuth("customer"), taskController.getSingleDailySubTask);
router.get('/all/sub-task/:id', auth("common"), taskController.getAllSubTask);
router.post('/sub-task', auth("common"), taskController.createSubTask);

// router.patch('/sub-task/:id', auth("commonForAdmin"), taskController.updateSubTask);
router.patch('/sub-task-to-manager', chewckAuth("customer"), taskController.updateManyTask);
router.get('/all/sub-task/manager/:id', chewckAuth("manager"), taskController.getAllSubTask);


router.patch('/update-task', auth("common"), taskController.updateManyTask);



// admin routes
router.get('/task-request-manager', auth("commonForAdmin"), taskController.getAllTaskRequestToManager);


router.get('/task-submited-customer/:id', chewckAuth("manager"), taskController.getAllTaskSubmitedToManager);
router.patch('/customer-viewed/:id', chewckAuth("manager"), taskController.getAllTaskViewedToManager);
router.patch('/manager/update-task', chewckAuth("manager"), taskController.updateManyTask);
router.get('/customer-task-search/:email', chewckAuth("manager"), taskController.getAllTaskSearchToManager);


module.exports = router;
