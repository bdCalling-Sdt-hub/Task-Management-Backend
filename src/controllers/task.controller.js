const taskService = require('../services/task.service');
const httpStatus = require('http-status');
const response = require('../config/response');

const createTask = async (req, res) => {
    try {
        const taskData = req.body;
        const newTask = await taskService.createTask(taskData);
        // console.log(newTask);
        res.status(httpStatus.CREATED).json(
            response({
                message: 'Task created successfully',
                status: 'OK',
                statusCode: httpStatus.CREATED,
                data: {},
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const createSubTask = async (req, res) => {
    try {
        const taskData = req.body;
        const newTask = await taskService.createSubTask(taskData);
        res.status(httpStatus.CREATED).json(
            response({
                message: 'Sub Task created successfully',
                status: 'OK',
                statusCode: httpStatus.CREATED,
                data: newTask,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const getAllTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Get page and limit from query params (defaults to 1 and 10 if not provided)
        const paginationResult = await taskService.getAllTasks(Number(page), Number(limit));

        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks retrieved successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: {
                    data: paginationResult.tasks,
                    pagination: {
                        totalTasks: paginationResult.totalTasks,
                        totalPages: paginationResult.totalPages,
                        currentPage: paginationResult.currentPage,
                        perPage: Number(limit),
                    }
                }

                ,

            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const getSingleTask = async (req, res) => {
    try {
        console.log(req.params.userID);



        const task = await taskService.getSingleTask(req.params.userID);  // Pass userID
        res.status(httpStatus.OK).json(
            response({
                message: 'Task retrieved successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: task,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const getSingleSubTask = async (req, res) => {
    try {
        console.log("Received Email:", req.params.email); // Debugging

        if (!req.params.email) {
            return res.status(httpStatus.BAD_REQUEST).json(
                response({
                    message: "Email is required",
                    status: "ERROR",
                    statusCode: httpStatus.BAD_REQUEST,
                })
            );
        }

        const task = await taskService.getSingleSubTask(req.params.email);

        res.status(httpStatus.OK).json(
            response({
                message: "Task retrieved successfully",
                status: "OK",
                statusCode: httpStatus.OK,
                data: task,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: "ERROR",
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};


// Controller Function

const updateManySubTasks = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging

        const updatedTasks = await taskService.updateManySubTasks(req.body);

        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks updated successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: updatedTasks,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};


const getAllTaskRequestToManager = async (req, res) => {
    try {
        const tasks = await taskService.getAllTaskRequestToManager();  // Pass userID
        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks retrieved successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: tasks,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};



const getAllSubTask = async (req, res) => {
    try {
        const tasks = await taskService.getAllSubTask(req.params.id);  // Pass userID
        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks retrieved successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: tasks,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const updateManyTask = async (req, res) => {
    try {
        const updatedTasks = await taskService.updateManyTask(req.body);

        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks updated successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: updatedTasks,
            })
        );
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};


module.exports = {
    createTask,
    getAllTasks,
    createSubTask,
    getSingleTask,
    getSingleSubTask,
    updateManySubTasks,
    getAllSubTask,
    updateManyTask,
    getAllTaskRequestToManager
};
