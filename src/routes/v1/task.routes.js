const express = require('express');
const taskController = require('../../controllers/task.controller');
const auth = require('../../middlewares/auth');
const chewckAuth = require('../../middlewares/memberAuth');
const router = express.Router();

router.post('/create-task', auth("commonForAdmin"), taskController.createTask);
router.get('/my-task/:userID', auth("commonForAdmin"), taskController.getSingleTask);
router.get('/all', auth("commonForAdmin"), taskController.getAllTasks);


// Sub-task routes

router.get('/all-sub-task/customer/:email', chewckAuth("customer"), taskController.getSingleSubTask);
router.get('/all/sub-task/:id', auth("common"), taskController.getAllSubTask);
router.post('/sub-task', auth("common"), taskController.createSubTask);

// router.patch('/sub-task/:id', auth("commonForAdmin"), taskController.updateSubTask);
router.patch('/sub-task-to-manager', chewckAuth("customer"), taskController.updateManyTask);


router.patch('/update-task', auth("common"), taskController.updateManyTask);

// admin routes
router.get('/task-request-manager', auth("commonForAdmin"), taskController.getAllTaskRequestToManager);



module.exports = router;
