const { SubTask, Member, User, } = require('../models');
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

const getAllWeeklySubTask = async () => {
    try {
        const task = await SubTask.find({ taskType: "Weekly" });  // Pass userID
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const getAllDailySubTask = async () => {
    try {
        const task = await SubTask.find({ taskType: "Daily" });  // Pass userID
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

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

                // Ensure subTasks are not empty before querying members


                // Return the task with its populated subTasks and the members assigned to this task
                return {
                    ...task.toObject(),
                    subTasks: subTasksData
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

        newSubTask.taskSubmissionDate = new Date();
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

        // Fetch user data to ensure they exist
        const user = await Member.findOne({ email: email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Log daily tasks to verify user.myDailyTasks structure
        console.log("User's Daily Tasks:", user.myDailyTasks);

        // Fetch the count of total weekly tasks assigned to the user
        const totalWeeklyTasks = await SubTask.countDocuments({ userEmail: email, taskType: "Weekly" });

        // Fetch the count of due (incomplete) weekly tasks
        const dueWeeklyTasks = await SubTask.countDocuments({ userEmail: email, taskType: "Weekly", isCompleted: false });

        // Make sure user has weekly tasks assigned
        if (!user.myWeeklyTasks || user.myWeeklyTasks.length === 0) {
            throw new ApiError(404, "No weekly tasks assigned to this user");
        }

        // Fetch the list of pending weekly tasks using the myWeeklyTasks array
        const weeklyTask = await SubTask.find({
            _id: { $in: user.myWeeklyTasks },
            isCompleted: false
        });

        console.log("Pending Weekly Tasks:", weeklyTask);

        // If no pending tasks, return a 404 error
        if (!weeklyTask.length) {
            throw new ApiError(404, "No pending weekly tasks found for this user");
        }

        // Return tasks along with the total and due counts



        return {
            tasks: weeklyTask,
            totalWeeklyTasks,
            dueWeeklyTasks,
        };
    } catch (error) {
        console.error("Error:", error); // Log any error that occurs during the execution
        throw new ApiError(500, error.message); // Return a 500 server error if an unexpected error occurs
    }
};

const getSingleDailySubTask = async (email) => {
    try {
        // Step 1: Check if the email is provided
        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const userEmail = email.toLowerCase(); // Normalize the email

        // Step 2: Fetch total and due daily tasks
        const totalDailyTasks = await SubTask.countDocuments({
            userEmail,
            taskType: "Daily"
        });

        const dueDailyTasks = await SubTask.countDocuments({
            userEmail,
            taskType: "Daily",
            isCompleted: false
        });

        // Step 3: Fetch the user to access their daily tasks
        const user = await Member.findOne({ email: email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Log the user's daily tasks to verify structure
        console.log("User's Daily Tasks:", user.myDailyTasks);

        // Step 4: Fetch the list of tasks that the user is assigned
        const dailyTasks = await SubTask.find({
            _id: { $in: user.myDailyTasks } // Match task IDs from user's `myDailyTasks`
            , isCompleted: false
        });

        // If no daily tasks are assigned, throw an error
        if (!dailyTasks.length) {
            throw new ApiError(404, "No daily tasks assigned to this user");
        }

        // Step 5: Return tasks along with the counts
        return {
            tasks: dailyTasks,
            totalDailyTasks,
            dueDailyTasks,
        };

    } catch (error) {
        console.error("Error fetching daily tasks:", error); // Log any error that occurs during execution
        throw new ApiError(500, error.message); // Return an internal server error if an exception occurs
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
        const task = await submitedTask.find({ userId: id });

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


        console.log("modifiedTaskData", modifiedTaskData);

        // Insert modified data into `submitedTask`
        const createMany = await submitedTask.insertMany(modifiedTaskData);
        console.log(createMany, modifiedTaskData);

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
        const queryDate = new Date(`${date}`); // Force UTC
        if (isNaN(queryDate)) {
            throw new ApiError(400, "Invalid date format. Use 'YYYY-MM-DD'.");
        }

        let startDate, endDate;

        // Handle day search (exact date)
        if (searchType === "day") {
            startDate = new Date(queryDate);
            startDate.setUTCHours(0, 0, 0, 0); // Start at midnight
            endDate = new Date(queryDate);
            endDate.setUTCHours(23, 59, 59, 999); // End at 23:59:59.999
        }
        // Handle week search (get the week for the given date)
        else if (searchType === "week") {
            const dayOfWeek = queryDate.getUTCDay();
            const dayOfMonth = queryDate.getDate();

            const startOfWeek = new Date(queryDate);
            const diffToMonday = (dayOfWeek === 0 ? 7 : dayOfWeek - 1); // Sunday should adjust to previous Monday
            startOfWeek.setUTCDate(dayOfMonth - diffToMonday); // Set to Monday
            startOfWeek.setUTCHours(0, 0, 0, 0); // Set to start of day

            endDate = new Date(startOfWeek);
            endDate.setUTCDate(startOfWeek.getUTCDate() + 7); // Add 6 days to get Sunday
            endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

            startDate = startOfWeek;
        } else {
            throw new ApiError(400, "Invalid search type. Use 'day' or 'week'.");
        }

        // Query tasks within the date range
        const tasks = await submitedTask.find({
            userId: userId,
            submitedDate: { $gte: startDate, $lte: endDate },
            taskType: searchType === "day" ? "Daily" : "Weekly",
        }).lean();

        if (!tasks.length) {
            throw new ApiError(404, `No tasks found for this customer on the given ${searchType}.`);
        }

        // Find subtasks by taskId
        const taskIds = tasks.map(task => task.taskId);
        const subtasksName = await SubTask.find({ _id: { $in: taskIds } }).lean();

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
        const customerImage = path.join(__dirname, "uploads/logo.png"); // Absolute path

        // console.log(customerImage);

        // // Check if the image exists
        // if (!fs.existsSync(customerImage)) {
        //     console.error("Image not found:", customerImage);
        //     // Optionally, use a fallback image if the logo is missing
        //     throw new ApiError(500, "Logo image file is missing or invalid");
        // }

        const pageWidth = doc.page.width; // Get PDF width
        const imageWidth = 100; // Set your image width
        const centerX = (pageWidth - imageWidth) / 2; // Calculate center position
        doc.image(customerImage, centerX, 30, { width: imageWidth }) // Centered Image

        doc.moveDown(2);
        doc.text(`${searchType === "day" ? "Daily Report" : "Weekly Report"}`, { align: "center" });
        doc.moveDown(5);

        const userName = await Member.findById(userId).select("memberName");

        doc.fontSize(12).text(`Customer: ${userName?.memberName}`);
        doc.moveDown(0.3);
        doc.text(`Date Range: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);
        doc.moveDown();

        // ✅ Task List
        tasks.forEach((task) => {
            doc.moveDown();

            const filteredSubtasks = subtasksName.filter(subtask =>
                subtask._id.toString() === task.taskId.toString()
            );

            doc.fontSize(14).font("Helvetica-Bold").fillColor("#004838").text(`${filteredSubtasks[0]?.subTaskName}`, { underline: true }).moveDown(0.5);

            // Task Details
            const formattedDate = new Date(task.submitedDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

            doc.fontSize(10).fillColor("#000")
                .moveDown(0.5) // Adds space between lines
                .font("Helvetica").text("Antwort: ", { continued: true }).font("Helvetica-Bold").text(`${task.title || "--"}`, { align: "right" })
                .moveDown(0.5)
                .font("Helvetica").text("Fehler/Information: ", { continued: true }).font("Helvetica-Bold").text(`${task.description || "--"}`, { align: "right" })
                .moveDown(0.5)
                .font("Helvetica").text("Erledigt am: ", { continued: true }).font("Helvetica-Bold").text(`${formattedDate || "--"}`, { align: "right" })
                .moveDown(1);

            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Separator Line
            doc.moveDown(1);
        });

        // ✅ Footer
        doc.moveTo(50, 745).lineTo(550, 750).stroke();

        doc.fontSize(8)
            .fillColor("#444444")
            .text("AGD-Menke", 50, 762, { align: "center" })
            .text("Franz-Meyer-Straße 16, 26219 Bösel", 50, 772, { align: "center" })
            .text("Mail: info@agd-menke.de | Tel: 01737034165", 50, 782, { align: "center" });

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


const submitAllTaskSubmitToAdmin = async ({ submitedTaskUrl, title, description }) => {
    try {




        // Create the submission
        // const submitTask = await TaskVieweAdmin.create({
        //     submitedTaskUrl: submitedTaskUrl,
        //     title,
        //     description,
        // });


        const task = await TaskVieweAdmin.findOne({ submitedTaskUrl: submitedTaskUrl });
        if (task) {
            return "This task has already been submitted.";
        }

        const submitTask = await TaskVieweAdmin.create({
            submitedTaskUrl: submitedTaskUrl,
            title,
            description,
        })

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

const getAllRejectedTask = async () => {
    try {
        const task = await TaskVieweAdmin.find({ isRead: false });
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getSingleRejectedTaskById = async ({ id }) => {
    try {
        console.log("id", id);
        const task = await TaskVieweAdmin.findById(id);
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}

const readSingleRejectedTaskById = async ({ id }) => {
    try {
        // console.log("id", id);
        const task = await TaskVieweAdmin.updateOne({ _id: id }, { $set: { isRead: true } });
        return task;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
}



cron.schedule("0 0 * * *", async () => {
    try {
        // Loop through Task (assuming it's an array of tasks)
        for (const subTask of Task) {
            if (subTask.taskType === "Daily") {
                // Loop through each subTask's subTasks
                for (const task of subTask.subTasks) {
                    // Await the update operation to ensure completion before moving to the next
                    await SubTask.updateOne({ _id: task._id }, { $set: { isCompleted: false } });
                }
            }
        }
        console.log("Tasks reset successfully!");
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
});


cron.schedule("0 0 * * 0", async () => {
    try {
        // Loop through Task (assuming it's an array of tasks)
        for (const subTask of Task) {
            if (subTask.taskType === "Weekly") {
                // Loop through each subTask's subTasks
                for (const task of subTask.subTasks) {
                    // Await the update operation to ensure completion before moving to the next
                    await SubTask.updateOne({ _id: task._id }, { $set: { isCompleted: false } });
                }
            }
        }
        console.log("Tasks reset successfully!");
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
    readSingleRejectedTaskById,
    getAllRejectedTask,
    getAllDailySubTask,
    getSingleRejectedTaskById,
    getAllWeeklySubTask,
    generatePdfForManager
};
