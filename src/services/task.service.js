const { Task } = require("../models");


const createTask = async (taskData) => {
    try {
        const task = new Task(taskData);
        await task.save();
        return task;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllTasks = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        // Fetch tasks with pagination
        const tasks = await Task.find().skip(skip).limit(limit);

        // Count total tasks for pagination metadata
        const totalTasks = await Task.countDocuments();

        return {
            tasks,
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getTask = async (id) => {
    const task = await Task.findById(id);
    if (!task) {
        throw new Error("Task not found");
    }
    return task;
};

const updateTask = async (id, updateBody) => {
    const task = await getTask(id);
    if (!task) {
        throw new Error("Task not found");
    }
    Object.assign(task, updateBody);
    await task.save();
    return task;

}

const getMyDailyTask = async (userId) => {

    const tasks = await Task.find({ assignCustomer: { $in: [userId] } });
    if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found for this user");
    }
    // tasks.taskType = "daily";
    return tasks;
    
};

module.exports = { createTask, getAllTasks, getTask, updateTask, getMyDailyTask };
