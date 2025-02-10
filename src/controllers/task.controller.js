const taskService = require('../services/task.service');
const httpStatus = require('http-status');
const response = require('../config/response');
const catchAsync = require('../utils/catchAsync');

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

const updateTaskAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = req.body;

        const updatedTask = await taskService.updateTaskAdmin(id, taskData);
        res.status(httpStatus.OK).json(
            response({
                message: 'Task updated successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: updatedTask,
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

const getSingleTaskById = async (req, res) => {
    try {
        const task = await taskService.getSingleTaskById(req.params.id);  // Pass userID
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

const getSingleSubTaskById = async (req, res) => {
    try {
        const task = await taskService.getSingleSubTaskById(req.params.id);  // Pass userID
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

const deleteSingleSubTaskById = async (req, res) => {
    try {
        const task = await taskService.deleteSingleSubTaskById(req.params.id);  // Pass userID
        res.status(httpStatus.OK).json(
            response({
                message: 'Task deleted successfully',
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
    const email = req.user.email;
    try {
        console.log("Received Email:", email); // Debugging

        if (!email) {
            return res.status(httpStatus.BAD_REQUEST).json(
                response({
                    message: "Email is required",
                    status: "ERROR",
                    statusCode: httpStatus.BAD_REQUEST,
                })
            );
        }

        const task = await taskService.getSingleSubTask(email);

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
const getSingleDailySubTask = async (req, res) => {
    const email = req.user.email;
    try {
        const task = await taskService.getSingleDailySubTask(email);  // Pass userID
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


const postTaskToManager = async (req, res) => {
    try {
        const { id } = req.user;

        const task = await taskService.postTaskToManager(req.body, id);  // Pass userID
        res.status(httpStatus.CREATED).json(
            response({
                message: 'Task Submit successfully !!',
                status: 'OK',
                statusCode: httpStatus.CREATED,
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
}


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
        console.log(tasks);

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
        // Call service function
        const updatedTasks = await taskService.updateManyTask(req.body);

        // Send success response
        res.status(httpStatus.OK).json(
            response({
                message: 'Tasks updated successfully',
                status: 'OK',
                statusCode: httpStatus.OK,
                data: updatedTasks,
            })
        );
    } catch (error) {
        // Handle errors
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
            response({
                message: error.message,
                status: 'ERROR',
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            })
        );
    }
};

const updateManyTaskSubmited = catchAsync(async (req, res) => {
    const tasks = await taskService.updateManyTaskSubmited(req.body);
    res.status(httpStatus.OK).json(
        response({
            message: 'Tasks updated successfully',
            status: 'OK',
            statusCode: httpStatus.OK,
            data: tasks,
        })
    );
})


const getAllTaskSubmitedToManager = catchAsync(async (req, res) => {
    const { id } = req.user;
    const tasks = await taskService.getAllTaskSubmitedToManager(id);
    res.status(httpStatus.OK).json(
        response({
            message: 'Tasks retrieved successfully',
            status: 'OK',
            statusCode: httpStatus.OK,
            data: tasks,
        })
    );
});


const getAllTaskViewedToManager = catchAsync(async (req, res) => {
    const tasks = await taskService.getAllTaskViewedToManager(req.params.id);
    res.status(httpStatus.OK).json(
        response({
            message: 'Viewed Customer retrieved successfully',
            status: 'OK',
            statusCode: httpStatus.OK,
            data: tasks,
        })
    );
});

const getAllTaskSearchToManager = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { date, searchType = 'day' } = req.query; // Default searchType is 'day'



    // Call the service to get tasks
    const tasks = await taskService.getAllTaskSearchToManager(userId, date, searchType);

    res.status(httpStatus.OK).json(
        response({
            message: "Customer tasks retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: tasks,
        })
    );
});


module.exports = {
    createTask,
    getAllTasks,
    createSubTask,
    getSingleTask,
    getSingleSubTask,
    updateManySubTasks,
    getAllSubTask,
    updateManyTask,
    getAllTaskRequestToManager,
    getAllTaskSubmitedToManager,
    getAllTaskViewedToManager,
    getAllTaskSearchToManager,
    getSingleDailySubTask,
    postTaskToManager,
    deleteSingleSubTaskById,
    getSingleSubTaskById,
    getSingleTaskById,
    updateTaskAdmin,
    updateManyTaskSubmited
};
