const { taskService } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const createTask = catchAsync(async (req, res, next) => {
    const { taskType, taskClassName, taskName, tasks, assignTaskManager, assignCustomer } = req.body;

    // Validate required fields
    if (!taskType || !taskClassName || !taskName || !tasks) {
        throw new ApiError(400, "All fields (taskType, taskClassName, taskName, tasks) are required");
    }

    const task = await taskService.createTask({ taskType, taskClassName, taskName, tasks, assignTaskManager, assignCustomer });

    res.status(201).json({
        message: "Task created successfully",
        status: "OK",
        statusCode: 201,
        task,
    });
});

const getAllTasks = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await taskService.getAllTasks(page, limit);

    res.status(200).json({
        message: "Tasks retrieved successfully",
        status: "OK",
        statusCode: 200,
        tasks: result.tasks,
        pagination: {
            totalTasks: result.totalTasks,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        },
    });
});

const getTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const task = await taskService.getTask(id);

    // Check if task exists
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    res.status(200).json({
        message: "Task retrieved successfully",
        status: "OK",
        statusCode: 200,
        task,
    });
});

const updateTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { taskType, taskClassName, taskName, tasks, assignCustomer } = req.body;

    // Validate required fields
    if (!taskType || !taskClassName || !taskName || !tasks) {
        throw new ApiError(400, "All fields (taskType, taskClassName, taskName, tasks) are required");
    }

    const task = await taskService.updateTask(id, { taskType, taskClassName, taskName, tasks });

    res.status(200).json({
        message: "Task updated successfully",
        status: "OK",
        statusCode: 200,
        task,
    });
});

const getMyDailyTask = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const task = await taskService.getMyDailyTask(id);

    // Check if task exists
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    res.status(200).json({
        message: "Task retrieved successfully",
        status: "OK",
        statusCode: 200,
        task,
    });
});


module.exports = { createTask, getAllTasks, getTask, updateTask, getMyDailyTask };
