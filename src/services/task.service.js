const { SubTask } = require('../models');
const mongoose = require('mongoose');
const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');

const createTask = async (taskData) => {
    try {
        const newTask = new Task(taskData);
        await newTask.save();
        return newTask;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getAllTasks = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit; // Calculate the number of documents to skip
        const tasks = await Task.find()
            .skip(skip)
            .limit(limit); // Limit the number of tasks returned

        const totalTasks = await Task.countDocuments(); // Get the total number of tasks
        const totalPages = Math.ceil(totalTasks / limit); // Calculate the total number of pages

        return {
            tasks,
            totalTasks,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const createSubTask = async (taskData) => { // Add this function
    try {
        console.log(taskData);
        // const newTask = new SubTask.find({e});
        // await newTask.save();
        // return newTask;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getSingleTask = async (userID) => {
    try {
        const task = await Task.find({ userID: userID });  // Query by userID
        if (userID === null) {
            throw new ApiError(404, "User Task not found");
        }
        // console.log(task);
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getSingleSubTask = async (email) => {
    try {
        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const task = await SubTask.find({ userEmail: email.toLowerCase() }); // Convert to lowercase

        if (!task.length) {
            throw new ApiError(404, "No tasks found for this email");
        }

        return task; // ✅ Fix: Return the task list
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const updateManySubTasks = async (tasks) => {
    try {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new ApiError(400, "Invalid task data");
        }

        // Validate ObjectIDs
        const invalidIds = tasks.filter(task => !mongoose.Types.ObjectId.isValid(task._id));
        if (invalidIds.length > 0) {
            throw new ApiError(400, "Invalid Task IDs");
        }

        // Prepare bulk operations
        const bulkOperations = tasks.map(task => ({
            updateOne: {
                filter: { _id: task._id }, // Match by ID
                update: { $set: task }     // Update fields dynamically
            }
        }));

        // Execute bulk update
        const result = await SubTask.bulkWrite(bulkOperations);
        return result;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const getAllSubTask = async (id) => { // Add this function
    try {
        const task = await SubTask.find({ managerId: id });
        const totalTasks = task.filter((task) => task.isCompleted === true && !task.resiveAdmin === true);

        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return totalTasks;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const updateManyTask = async (tasks) => {
    try {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new ApiError(400, "Invalid task data");
        }

        // Prepare bulk operations
        const bulkOperations = tasks.map(task => ({
            updateOne: {
                filter: { _id: task._id }, // Match by ID
                update: { $set: task }     // Update fields dynamically
            }
        }));

        // Execute bulk update
        const result = await SubTask.bulkWrite(bulkOperations);
        return result;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const getAllTaskRequestToManager = async () => {
    try {
        const task = await SubTask.find({ resiveAdmin: true });
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
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
