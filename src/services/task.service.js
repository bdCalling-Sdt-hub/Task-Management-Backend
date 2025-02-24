const { SubTask, Member, User } = require('../models');
const mongoose = require('mongoose');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const submitedTask = require('../models/submitedTask');
const cron = require("node-cron");
const TaskVieweAdmin = require('../models/taskVieweAdmin.model');


const createTask = async (taskData) => {
    try {
        const newTask = new Task(taskData);
        await newTask.save();
        return newTask;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getAllTaskFromManager = async () => {
    try {
        const task = await submitedTask.find({ resiveAdmin: true });  // Pass userID
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const deleteTaskAdmin = async (id) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            throw new ApiError(404, "Task not found");
        }
        return deletedTask;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const updateTaskAdmin = async (id, taskData) => {
    try {

        const updatedTask = await Task.findByIdAndUpdate(id, taskData, { new: true });

        if (!updatedTask) {
            throw new ApiError(404, "Task not found");
        }
        return updatedTask;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}
const getAllTasks = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        // Fetch tasks with pagination
        const tasks = await Task.find()
            .skip(skip)
            .limit(limit); // Limit the number of tasks returned

        if (tasks.length === 0) {
            throw new ApiError(404, "No tasks found");
        }

        // Fetch and populate subTasks data for each task
        const taskWithSubTasks = await Promise.all(
            tasks.map(async (task) => {
                let subTasksData = [];
                if (task.subTasks && task.subTasks.length > 0) {
                    // Populate subTasks only if there are any subtask IDs
                    subTasksData = await SubTask.find({ _id: { $in: task.subTasks } }).lean();
                }
                // Return the task with its populated subTasks data
                return {
                    ...task.toObject(),
                    subTasks: subTasksData,
                };
            })
        );

        // Get total task count for pagination
        const totalTasks = await Task.countDocuments(); // Get the total number of tasks
        const totalPages = Math.ceil(totalTasks / limit); // Calculate the total number of pages

        // Return tasks with populated subTasks, pagination info
        return {
            tasks: taskWithSubTasks,
            totalTasks,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        throw new ApiError(500, error.message); // Handle any errors
    }
};



const getSingleTaskById = async (id) => {
    try {
        // 1️⃣ Fetch Task
        const task = await Task.findById(id).lean();
        if (!task) {
            throw new ApiError(404, "Task not found");
        }

        let subTasksData = [];
        if (Array.isArray(task.subTasks) && task.subTasks.length > 0) {
            subTasksData = await SubTask.find({ _id: { $in: task.subTasks } }).lean();
        }

        console.log("subTasksData", subTasksData);

        // 3️⃣ Return Task with Populated SubTasks
        return {
            ...task,      // Spread task data
            subTasks: subTasksData  // Replace IDs with full subtask data
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

        const task = await SubTask.find({ userEmail: email, taskType: "Weekly", isCompleted: false }); // Convert to lowercase

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

        const task = await SubTask.find({ userEmail: email.toLowerCase(), taskType: "Daily", isCompleted: false }); // Convert to lowercase

        console.log("task daily", task);

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
        const task = await submitedTask.find({ managerId: id });

        console.log("task", task);

        const totalTasks = task.filter((task) => task.status === "pending");

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

        // Validate ObjectIDs
        const invalidIds = tasks.filter(task => !mongoose.Types.ObjectId.isValid(task.taskId));
        if (invalidIds.length > 0) {
            throw new ApiError(400, "Invalid Task IDs");
        }


        console.log("tasks", tasks);

        // Prepare bulk operations
        const bulkOperations = tasks.map(task => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(task.taskId) }, // Ensure proper ObjectId conversion
                update: {
                    $set: { resiveAdmin: task.resiveAdmin ?? true } // Set dynamically or default to true
                }
            }
        }));

        // Execute bulk update
        const result = await submitedTask.bulkWrite(bulkOperations);

        return result;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const updateManyTaskSubmited = async (tasks) => {
    try {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new ApiError(400, "Invalid task data");
        }

        // Validate ObjectIDs
        const invalidIds = tasks.filter(task => !mongoose.Types.ObjectId.isValid(task.taskId));
        if (invalidIds.length > 0) {
            throw new ApiError(400, "Invalid Task IDs");
        }

        // Prepare bulk operations
        const bulkOperations = tasks.map(task => ({
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(task.taskId) }, // Ensure proper ObjectId conversion
                update: {
                    $set: {
                        resiveAdmin: true, // Set dynamically or default to true
                    }
                }
            }
        }));

        console.log("bulkOperations", bulkOperations);

        // Execute bulk update
        const result = await submitedTask.bulkWrite(bulkOperations);
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
            { $set: { isCompleted: true, updatedAt: new Date(), taskSubmissionDate: new Date() } }
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
            resiveAdmin: false
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

        console.log("updatedTasks", updatedTasks);

        return updatedTasks;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const getAllTaskSearchToManager = async (userId, date, searchType, managerId) => {
    try {
        if (!userId || !date) {
            throw new ApiError(400, "Customer email and date are required");
        }

        // Convert provided date string (YYYY-MM-DD) to a valid Date object
        const queryDate = new Date(`${date}T00:00:00.000Z`); // Force UTC
        if (isNaN(queryDate)) {
            throw new ApiError(400, "Invalid date format. Use 'YYYY-MM-DD'.");
        }

        let startDate, endDate;

        if (searchType === "day") {
            startDate = new Date(queryDate);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate = new Date(queryDate);
            endDate.setUTCHours(23, 59, 59, 999);
        } else if (searchType === "week") {
            // Get the start of the week (Monday)
            startDate = new Date(queryDate);
            const dayOfWeek = startDate.getUTCDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
            startDate.setUTCDate(startDate.getUTCDate() + diff);
            startDate.setUTCHours(0, 0, 0, 0);

            // Get the end of the week (Sunday)
            endDate = new Date(startDate);
            endDate.setUTCDate(startDate.getUTCDate() + 6);
            endDate.setUTCHours(23, 59, 59, 999);
        } else {
            throw new ApiError(400, "Invalid search type. Use 'day' or 'week'.");
        }

        console.log("Start Date:", startDate.toISOString());
        console.log("End Date:", endDate.toISOString());

        // Query tasks within the date range
        const tasks = await submitedTask.find({
            userId: userId,
            submitedDate: { $gte: startDate, $lte: endDate }
        }).lean();

        if (!tasks.length) {
            throw new ApiError(404, `No tasks found for this customer on the given ${searchType}.`);
        }

        // ✅ Create PDF File
        const pdfDirectory = path.join(__dirname, "../../public/pdf");
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true }); // Create folder if it doesn't exist
        }

        // Set PDF file path
        const filename = `task_report_${Date.now()}.pdf`;
        const pdfPath = path.join(pdfDirectory, filename);
        const publicPath = `/pdf/${filename}`; // This will be returned in the response

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);


        // ✅ Customer image and details
        const customerImage = path.join(__dirname, "../../public/uploads/logo.png"); // Absolute path
        const pageWidth = doc.page.width; // Get PDF width
        const imageWidth = 100; // Set your image width
        const centerX = (pageWidth - imageWidth) / 2; // Calculate center position
        doc.image(customerImage, centerX, 30, { width: imageWidth }) // Centered Image
        doc.moveDown(2);
        doc.text(`${searchType == "day" ? "Daily Report" : "Weekly Report"}`, { align: "center" });
        doc.moveDown(5);



        const userName = await Member.findById(userId).select("memberName");

        doc.fontSize(12).text(`Customer: ${userName?.memberName}`);
        doc.text(`Date Range: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);
        // doc.text(`Report Type: ${searchType.toUpperCase()}`);
        doc.moveDown();



        // ✅ Task List
        tasks.forEach((task, index) => {
            const formattedDate = new Date(task.submitedDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });



            doc.fontSize(12).fillColor("#333").text(`Task ${index + 1}`, { underline: true }).moveDown(0.5);
            doc.fontSize(10).fillColor("#000")
                // .text("Task ID: ", { continued: true }).font("Helvetica-Bold").text(`${task._id}`, { align: "right" })
                .moveDown(0.5) // Adds space between lines

                .font("Helvetica").text("Task Title: ", { continued: true }).font("Helvetica-Bold").text(`${task.title}`, { align: "right" })
                .moveDown(0.5)

                .font("Helvetica").text("Description: ", { continued: true }).font("Helvetica-Bold").text(`${task.description}`, { align: "right" })
                .moveDown(0.5)

                .font("Helvetica").text("Task Type: ", { continued: true }).font("Helvetica-Bold").text(`${task.taskType}`, { align: "right" })
                .moveDown(0.5)

                .font("Helvetica").text("Submission Date: ", { continued: true }).font("Helvetica-Bold").text(`${formattedDate}`, { align: "right" })
                .moveDown(1); // Extra space after the last field


            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator Line
            doc.moveDown(1);
        });

        // ✅ Footer
        doc.moveTo(50, 750).lineTo(550, 750).stroke();
        doc.fontSize(10)
            .fillColor("#444444")
            .text("Task Management Company", 50, 760, { align: "center" })
            .text("Address: 123 Business Street, City, Country", 50, 775, { align: "center" })
        // .text("Email: support@company.com | Phone: +1234567890", 50, 790, { align: "right" });

        doc.end();

        return new Promise((resolve, reject) => {
            writeStream.on("finish", () => {
                console.log("PDF Created Successfully:", publicPath);
                resolve({ pdfPath: publicPath });
            });

            writeStream.on("error", (error) => {
                console.error("Error writing PDF:", error);
                reject(new ApiError(500, "Error generating PDF"));
            });
        });

    } catch (error) {
        console.error("Error in getAllTaskSearchToManager:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error");
    }
};



const getAllCustommerForManager = async ({ id }) => {
    try {
        console.log("id", id);

        const task = await Member.find({ assignedManager: id })
            .select("_id memberName profileImage location isVisible isViewed email role assignedManager")
            .sort({ isViewed: 1 }); // Sorting: isViewed = false (0) first, then isViewed = true (1)

        if (!task) {
            throw new ApiError(404, "Task not found");
        }
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};


const submitAllTaskSubmitToAdmin = async ({ allTaskId, title, description }) => {
    try {
        // Fetch the tasks
        const tasks = await submitedTask.find({ _id: { $in: allTaskId } });

        if (!tasks.length) {
            throw new ApiError(404, "No tasks found with the given IDs.");
        }

        // Filter only pending tasks
        const pendingTasks = tasks.filter(task => task.status === "pending");

        if (!pendingTasks.length) {
            throw new ApiError(400, "No tasks with 'pending' status found.");
        }

        // Create the submission
        const submitTask = await TaskVieweAdmin.create({
            allTaskId: pendingTasks.map(task => task._id),
            userId: tasks[0].userId,
            managerId: tasks[0].managerId,
            title,
            description,
        });

        return submitTask;

    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const generatePdfForManager = async ({ ids }) => {

    const task = await submitedTask.find({ _id: { $in: ids } }); // find ids from the array multiple data of task


    console.log("task", task);

    return new Promise((resolve, reject) => {
        try {
            // Define a public-accessible directory for PDFs
            const pdfDirectory = path.join(__dirname, "../../public/pdf");
            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true }); // Create folder if it doesn't exist
            }

            // Set relative PDF path
            const filename = `task_${Date.now()}.pdf`;
            const pdfPath = path.join(pdfDirectory, filename);
            const publicPath = `/public/pdf/${filename}`; // This will be used in the response

            // Create a PDF document
            const doc = new PDFDocument();
            const writeStream = fs.createWriteStream(pdfPath);

            doc.pipe(writeStream);

            // Add Content to PDF
            doc.fontSize(18).text("Task Details", { align: "center" });
            doc.moveDown();

            task.forEach((task, index) => {
                doc.fontSize(14).text(`Task ID: ${task._id}`);
                doc.text(`Task Title: ${task.title}`);
                doc.text(`Description: ${task.description}`);
                doc.text(`TaskType: ${task.taskType}`);
                doc.text(`Submission Date: ${task.submissionDate}`);
                doc.moveDown();
            });

            // doc.fontSize(14).text(`Task ID: `);
            // doc.text(`Task Name: Example Task`);
            // doc.text(`Assigned By: John Doe`);
            // doc.text(`Status: Completed`);
            // doc.text(`Submission Date: 2024-02-23`);
            // doc.moveDown();

            doc.end();

            // Ensure the file is fully written before returning the path
            writeStream.on("finish", () => {
                console.log("PDF Created Successfully:", publicPath);
                resolve(publicPath); // Return relative URL instead of full system path
            });

            writeStream.on("error", (error) => {
                console.error("Error writing PDF:", error);
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};



cron.schedule("0 0 * * *", async () => {
    try {
        await SubTask.updateMany(
            { isCompleted: true, taskType: "Daily" },
            { $set: { isCompleted: false } }
        );

        console.log("Tasks reset successfully!");
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
});


cron.schedule("0 0 * * 0", async () => {
    try {
        await SubTask.updateMany(
            { isCompleted: true, taskType: "Weekly" },
            { $set: { isCompleted: false } }
        );
        console.log("Weekly Tasks reset successfully!");
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
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
    getSingleSubTaskById,
    deleteSingleSubTaskById,
    getSingleTaskById,
    updateTaskAdmin,
    updateManyTaskSubmited,
    getAllTaskFromManager,
    deleteTaskAdmin,
    getAllCustommerForManager,

    submitAllTaskSubmitToAdmin,
    generatePdfForManager
};
