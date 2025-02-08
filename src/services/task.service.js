const { SubTask, Member, User } = require('../models');
const mongoose = require('mongoose');
const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const submitedTask = require('../models/submitedTask');

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

const getSingleSubTaskById = async (id) => {
    try {
        const task = await SubTask.findById(id);
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const deleteSingleSubTaskById = async (id) => {
    try {
        const task = await SubTask.findByIdAndDelete(id);
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const createSubTask = async (taskData) => {
    try {
        console.log("Creating subtask:", taskData);
        // Create a new subtask instance
        const newSubTask = new SubTask(taskData);
        // Save to database
        await newSubTask.save();
        return newSubTask;
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

        const task = await SubTask.find({ userEmail: email, taskType: "Weekly" }); // Convert to lowercase

        console.log("task", task);

        if (!task.length) {
            throw new ApiError(404, "No tasks found for this email");
        }

        return task; // ✅ Fix: Return the task list
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const getSingleDailySubTask = async (email) => {
    try {
        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const task = await SubTask.find({ userEmail: email.toLowerCase(), taskType: "Daily" }); // Convert to lowercase



        if (!task.length) {
            throw new ApiError(404, "No tasks found for this email");
        }

        return task; // ✅ Fix: Return the task list
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

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


const postTaskToManager = async (taskData, userID) => {
    try {
        // Find user and managerId
        const user = await Member.findById(userID);
        if (!user) throw new ApiError(404, "User not found");

        const managerId = user.assignedManager ? user.assignedManager.toString() : null;
        if (!managerId) throw new ApiError(400, "Assigned manager not found");

        // Ensure taskData is an array
        if (!Array.isArray(taskData) || taskData.length === 0) {
            throw new ApiError(400, "Invalid or empty taskData");
        }

        // Extract task IDs for updateMany
        const taskIds = taskData.map(task => task.taskId);

        // Update existing tasks: Set `resiveAdmin: true`
        const updateSubTask = await SubTask.updateMany(
            { _id: { $in: taskIds } },
            { $set: { isCompleted: true, updatedAt: new Date() } }
        );

        if (updateSubTask.modifiedCount === 0) {
            throw new ApiError(404, "No tasks were updated, possibly not found");
        }

        // Prepare new task data for insertion
        const modifiedTaskData = taskData.map(task => ({
            ...task,
            userId: userID,
            managerId: managerId,
            submitedDate: new Date(),
        }));

        // Insert modified data into `submitedTask`
        const createMany = await submitedTask.insertMany(modifiedTaskData);

        return createMany;
    } catch (error) {
        console.error("Error in postTaskToManager:", error.message);
        throw new ApiError(500, error.message);
    }
}

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

const getAllTaskSubmitedToManager = async (id) => {
    try {
        const task = await Member.find({ assignedManager: id }).select(
            "_id memberName profileImage location isVisible isViewed email role assignedManager "
        );
        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getAllTaskViewedToManager = async (customerId) => {
    try {
        // Update all tasks assigned to the manager, setting isViewed to true
        const updatedTasks = await Member.updateMany(
            { _id: customerId, isViewed: false }, // Find tasks that haven't been viewed
            { $set: { isViewed: true } }, // Update isViewed field to true
            { new: true } // Return updated documents
        );

        if (!updatedTasks) {
            throw new ApiError(404, "Viewed Member not found for this manager");
        }

        return updatedTasks;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const getAllTaskSearchToManager = async (customerEmail, date, searchType = 'day') => {
    try {
        if (!customerEmail || !date) {
            throw new ApiError(400, "Customer email and date are required");
        }

        // Convert provided date string (YYYY-MM-DD) to a valid Date object
        const queryDate = new Date(date);
        if (isNaN(queryDate)) {
            throw new ApiError(400, "Invalid date format. Use 'YYYY-MM-DD'.");
        }

        let startDate, endDate;

        if (searchType === 'day') {
            // Define start and end of the selected date
            startDate = new Date(queryDate);
            startDate.setHours(0, 0, 0, 0); // Start of the day

            endDate = new Date(queryDate);
            endDate.setHours(23, 59, 59, 999); // End of the day
        } else if (searchType === 'week') {
            // Calculate the start of the week (Sunday)
            startDate = new Date(queryDate);
            startDate.setDate(queryDate.getDate() - queryDate.getDay()); // Start of the week (Sunday)
            startDate.setHours(0, 0, 0, 0);

            // Calculate the end of the week (Saturday)
            endDate = new Date(queryDate);
            endDate.setDate(queryDate.getDate() + (7 - queryDate.getDay())); // End of the week (Saturday)
            endDate.setHours(23, 59, 59, 999);
        } else {
            throw new ApiError(400, "Invalid search type. Use 'day' or 'week'.");
        }

        // Query tasks within the date range
        const tasks = await SubTask.find({
            userEmail: customerEmail,
            taskSubmissionDate: { $gte: startDate, $lte: endDate }
        }).lean();

        if (!tasks.length) {
            throw new ApiError(404, `No tasks found for this customer on the given ${searchType}.`);
        }

        return tasks;
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error");
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
    getAllTaskRequestToManager,
    getAllTaskSubmitedToManager,
    getAllTaskViewedToManager,
    getAllTaskSearchToManager,
    getSingleDailySubTask,
    postTaskToManager,
    getSingleSubTaskById,
    deleteSingleSubTaskById
};
